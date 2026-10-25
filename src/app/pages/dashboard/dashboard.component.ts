import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Project, Sprint, Task, User } from '../../core/models';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/users.service';
import { daysLeft, formatRange, progressOf, sprintState } from '../../core/sprint-utils';
import { AvatarComponent } from '../../shared/avatar.component';
import { IconComponent } from '../../shared/icon.component';

interface SprintRow {
  sprint: Sprint;
  project: Project;
  range: string;
  daysLeft: number;
  done: number;
  inProgress: number;
  total: number;
  percent: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, IconComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private userService = inject(UserService);

  projects = signal<Project[]>([]);
  users = signal<User[]>([]);
  loading = signal(true);
  failed = signal(false);

  readonly greeting = greetingFor(new Date());
  readonly todayLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  private allSprints = computed(() =>
    this.projects().flatMap((project) => project.sprints.map((sprint) => ({ sprint, project }))),
  );

  activeSprints = computed<SprintRow[]>(() =>
    this.allSprints()
      .filter(({ sprint }) => sprintState(sprint) === 'active')
      .map(({ sprint, project }) => {
        const p = progressOf(sprint.tasks);
        return {
          sprint,
          project,
          range: formatRange(sprint),
          daysLeft: daysLeft(sprint),
          done: p.done,
          inProgress: p.inProgress,
          total: p.total,
          percent: p.percent,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft),
  );

  /** Tasks of the running sprints: what the team is working on right now. */
  private currentTasks = computed(() => this.activeSprints().flatMap((row) => row.sprint.tasks));

  stats = computed(() => {
    const tasks = this.allSprints().flatMap(({ sprint }) => sprint.tasks);
    const current = progressOf(this.currentTasks());
    return {
      projects: this.projects().length,
      activeSprints: this.activeSprints().length,
      openTasks: tasks.filter((t) => t.status !== 'DONE').length,
      inProgress: current.inProgress,
      currentDone: current.done,
      currentTotal: current.total,
      currentPercent: current.percent,
      people: this.users().length,
    };
  });

  /** Open high-priority tasks in running sprints, the ones worth a look first. */
  focus = computed(() =>
    this.activeSprints()
      .flatMap((row) => row.sprint.tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'DONE').map((task) => ({ task, row })))
      .slice(0, 6),
  );

  /** Open tasks per person across running and upcoming sprints. */
  workload = computed(() => {
    const counts = new Map<number, { user: User; todo: number; inProgress: number }>();
    for (const user of this.users()) counts.set(user.id, { user, todo: 0, inProgress: 0 });
    let unassigned = 0;

    const open: Task[] = this.allSprints()
      .filter(({ sprint }) => sprintState(sprint) !== 'finished')
      .flatMap(({ sprint }) => sprint.tasks)
      .filter((t) => t.status !== 'DONE');

    for (const task of open) {
      const entry = task.assignedTo ? counts.get(task.assignedTo.id) : undefined;
      if (!entry) {
        unassigned++;
      } else if (task.status === 'IN_PROGRESS') {
        entry.inProgress++;
      } else {
        entry.todo++;
      }
    }

    const rows = [...counts.values()]
      .filter((r) => r.todo + r.inProgress > 0)
      .sort((a, b) => b.todo + b.inProgress - (a.todo + a.inProgress));
    const max = Math.max(1, ...rows.map((r) => r.todo + r.inProgress));
    return { rows, max, unassigned };
  });

  ngOnInit(): void {
    forkJoin({ projects: this.projectService.getProjects(), users: this.userService.getAllUsers() }).subscribe({
      next: ({ projects, users }) => {
        this.projects.set(projects);
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.failed.set(true);
      },
    });
  }

  daysLabel(days: number): string {
    if (days === 0) return 'Last day';
    return days === 1 ? '1 day left' : `${days} days left`;
  }
}

function greetingFor(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
