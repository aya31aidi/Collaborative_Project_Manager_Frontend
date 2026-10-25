import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, concatMap, forkJoin, from, last, map, of, switchMap, toArray } from 'rxjs';
import { Project, Team, User } from '../../core/models';
import { ProjectService } from '../../core/services/project.service';
import { TeamsService } from '../../core/services/teams.service';
import { UserService } from '../../core/services/users.service';
import { STATE_LABEL, currentSprint, progressOf, sprintState } from '../../core/sprint-utils';
import { ToastService } from '../../core/toast.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, IconComponent, AvatarComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit {
  private projectService = inject(ProjectService);
  private teamsService = inject(TeamsService);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  readonly stateLabel = STATE_LABEL;

  projects = signal<Project[]>([]);
  teams = signal<Team[]>([]);
  users = signal<User[]>([]);
  loading = signal(true);
  search = signal('');

  creating = signal(false);
  saving = signal(false);
  teamMode = signal<'existing' | 'new'>('new');
  members = signal<number[]>([]);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', Validators.maxLength(255)],
    teamId: [null as number | null],
    teamName: [''],
  });

  /** A team works on one project at a time, so only free teams can be picked. */
  freeTeams = computed(() => this.teams().filter((t) => !t.project));

  cards = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.projects()
      .filter((p) => !query || p.name.toLowerCase().includes(query) || (p.description ?? '').toLowerCase().includes(query))
      .map((project) => {
        const tasks = project.sprints.flatMap((s) => s.tasks);
        const current = currentSprint(project.sprints);
        return {
          project,
          progress: progressOf(tasks),
          current,
          currentState: current ? sprintState(current) : null,
        };
      });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    forkJoin({
      projects: this.projectService.getProjects(),
      teams: this.teamsService.getAllTeams(),
      users: this.userService.getAllUsers(),
    }).subscribe({
      next: ({ projects, teams, users }) => {
        this.projects.set(projects);
        this.teams.set(teams);
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    const free = this.freeTeams();
    this.teamMode.set(free.length ? 'existing' : 'new');
    this.members.set([]);
    this.form.reset({ name: '', description: '', teamId: free[0]?.id ?? null, teamName: '' });
    this.creating.set(true);
  }

  toggleMember(id: number): void {
    this.members.update((list) => (list.includes(id) ? list.filter((m) => m !== id) : [...list, id]));
  }

  create(): void {
    const value = this.form.getRawValue();
    const newTeam = this.teamMode() === 'new';
    if (this.form.controls.name.invalid || (newTeam ? !value.teamName.trim() : value.teamId === null)) {
      this.form.markAllAsTouched();
      return;
    }

    // New team: create it, add the chosen people one after the other, then the project.
    const team$: Observable<number> = newTeam
      ? this.teamsService.createTeam(value.teamName.trim()).pipe(
          switchMap((team) =>
            this.members().length
              ? from(this.members()).pipe(
                  concatMap((userId) => this.teamsService.addMember(team.id, userId)),
                  toArray(),
                  map(() => team.id),
                )
              : of(team.id),
          ),
          last(),
        )
      : of(Number(value.teamId));

    this.saving.set(true);
    team$
      .pipe(
        switchMap((teamId) =>
          this.projectService.addProject(teamId, { name: value.name.trim(), description: value.description.trim() }),
        ),
      )
      .subscribe({
        next: (project) => {
          this.saving.set(false);
          this.creating.set(false);
          this.toast.success('Project created');
          this.router.navigate(['/projects', project.id]);
        },
        error: () => {
          this.saving.set(false);
          this.load(); // a team may have been created before the error
        },
      });
  }
}
