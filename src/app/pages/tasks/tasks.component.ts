import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRIORITIES, STATUSES, Task, TaskPriority, TaskStatus } from '../../core/models';
import { TasksService } from '../../core/services/tasks.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { IconComponent } from '../../shared/icon.component';

const STATUS_ORDER: Record<TaskStatus, number> = { IN_PROGRESS: 0, TO_DO: 1, DONE: 2 };
const PRIORITY_ORDER: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [RouterLink, IconComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent implements OnInit {
  private tasksService = inject(TasksService);

  readonly statuses = STATUSES;
  readonly priorities = PRIORITIES;
  readonly statusLabel = Object.fromEntries(STATUSES.map((s) => [s.value, s.label])) as Record<TaskStatus, string>;

  tasks = signal<Task[]>([]);
  loading = signal(true);
  search = signal('');
  status = signal<TaskStatus | 'all'>('all');
  priority = signal<TaskPriority | 'all'>('all');

  counts = computed(() => {
    const all = this.tasks();
    return Object.fromEntries(STATUSES.map((s) => [s.value, all.filter((t) => t.status === s.value).length])) as Record<
      TaskStatus,
      number
    >;
  });

  // Work in progress first, then what is left to do; high priority first inside each group.
  visible = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.tasks()
      .filter((t) => this.status() === 'all' || t.status === this.status())
      .filter((t) => this.priority() === 'all' || t.priority === this.priority())
      .filter(
        (t) =>
          !query ||
          t.title.toLowerCase().includes(query) ||
          (t.assignedTo?.fullName ?? '').toLowerCase().includes(query) ||
          (t.sprintName ?? '').toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.name.toLowerCase().includes(query)),
      )
      .sort(
        (a, b) =>
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
          a.id - b.id,
      );
  });

  ngOnInit(): void {
    this.tasksService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setPriority(value: string): void {
    this.priority.set(value as TaskPriority | 'all');
  }
}
