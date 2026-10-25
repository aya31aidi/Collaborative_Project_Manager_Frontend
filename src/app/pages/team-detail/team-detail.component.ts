import { ChangeDetectionStrategy, Component, OnChanges, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ConfirmService } from '../../core/confirm.service';
import { Team, User } from '../../core/models';
import { TeamsService } from '../../core/services/teams.service';
import { UserService } from '../../core/services/users.service';
import { ToastService } from '../../core/toast.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent, AvatarComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team-detail.component.html',
  styleUrl: './team-detail.component.css',
})
export class TeamDetailComponent implements OnChanges {
  private teamsService = inject(TeamsService);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private router = inject(Router);

  /** Route parameter :id */
  id = input.required<string>();

  team = signal<Team | null>(null);
  people = signal<User[]>([]);
  loading = signal(true);
  notFound = signal(false);

  renaming = signal(false);
  name = '';
  selectedUser: number | null = null;

  /** People who are not in the team yet. */
  candidates = computed(() => {
    const inTeam = new Set(this.team()?.users.map((u) => u.id));
    return this.people().filter((p) => !inTeam.has(p.id));
  });

  ngOnChanges(): void {
    this.loading.set(true);
    forkJoin({ team: this.teamsService.getTeam(Number(this.id())), people: this.userService.getAllUsers() }).subscribe({
      next: ({ team, people }) => {
        this.team.set(team);
        this.people.set(people);
        this.selectedUser = null;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
  }

  addMember(): void {
    const team = this.team();
    if (!team || this.selectedUser === null) return;
    this.teamsService.addMember(team.id, Number(this.selectedUser)).subscribe((updated) => {
      this.team.set(updated);
      this.selectedUser = null;
      this.toast.success('Member added');
    });
  }

  async removeMember(user: User): Promise<void> {
    const team = this.team()!;
    const ok = await this.confirm.ask({
      title: `Remove ${user.fullName}?`,
      message: `${user.fullName} leaves ${team.name}. Their tasks keep their assignee until someone changes it.`,
      confirmLabel: 'Remove',
    });
    if (!ok) return;
    this.teamsService.removeMember(team.id, user.id).subscribe((updated) => {
      this.team.set(updated);
      this.toast.success('Member removed');
    });
  }

  openRename(): void {
    this.name = this.team()!.name;
    this.renaming.set(true);
  }

  rename(): void {
    const name = this.name.trim();
    if (!name) return;
    this.teamsService.renameTeam(this.team()!.id, name).subscribe((updated) => {
      this.team.set(updated);
      this.renaming.set(false);
      this.toast.success('Team renamed');
    });
  }

  async remove(): Promise<void> {
    const team = this.team()!;
    const ok = await this.confirm.ask({
      title: 'Delete this team?',
      message: team.project
        ? `${team.name} is deleted; the project "${team.project.name}" stays, without a team.`
        : `${team.name} is deleted. Its members stay registered.`,
      confirmLabel: 'Delete team',
    });
    if (!ok) return;
    this.teamsService.deleteTeam(team.id).subscribe(() => {
      this.toast.success('Team deleted');
      this.router.navigate(['/teams']);
    });
  }
}
