import { ChangeDetectionStrategy, Component, OnChanges, computed, inject, input, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ConfirmService } from '../../core/confirm.service';
import { PRIORITIES, STATUSES, Sprint, Task, TaskInput, TaskPriority, TaskStatus, User } from '../../core/models';
import { SprintService } from '../../core/services/sprints.service';
import { TasksService } from '../../core/services/tasks.service';
import { STATE_LABEL, formatRange, progressOf, sprintNote, sprintState, timeElapsed } from '../../core/sprint-utils';
import { ToastService } from '../../core/toast.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';
import { SprintFormComponent } from '../../shared/sprint-form.component';

type AssigneeFilter = 'all' | 'none' | number;

@Component({
  selector: 'app-sprint-board',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    IconComponent,
    AvatarComponent,
    ModalComponent,
    SprintFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sprint-board.component.html',
  styleUrl: './sprint-board.component.css',
})
export class SprintBoardComponent implements OnChanges {
  private sprints = inject(SprintService);
  private tasks = inject(TasksService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  /** Route parameter :id */
  id = input.required<string>();

  readonly statuses = STATUSES;
  readonly priorities = PRIORITIES;
  readonly stateLabel = STATE_LABEL;

  sprint = signal<Sprint | null>(null);
  members = signal<User[]>([]);
  loading = signal(true);
  notFound = signal(false);

  search = signal('');
  assignee = signal<AssigneeFilter>('all');
  priority = signal<TaskPriority | 'all'>('all');

  // Task dialog: null = closed, 'new' = creating, a Task = editing it.
  editing = signal<Task | 'new' | null>(null);
  editingSprint = signal(false);
  saving = signal(false);
  tagDraft = signal('');
  tags = signal<string[]>([]);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', Validators.maxLength(255)],
    status: ['TO_DO' as TaskStatus],
    priority: ['MEDIUM' as TaskPriority],
    assigneeId: [null as number | null],
  });

  state = computed(() => {
    const s = this.sprint();
    return s ? sprintState(s) : 'upcoming';
  });

  progress = computed(() => progressOf(this.sprint()?.tasks ?? []));
  range = computed(() => (this.sprint() ? formatRange(this.sprint()!) : ''));
  elapsed = computed(() => (this.sprint() ? timeElapsed(this.sprint()!) : 0));

  timeNote = computed(() => (this.sprint() ? sprintNote(this.sprint()!) : ''));

  filtersActive = computed(() => !!this.search().trim() || this.assignee() !== 'all' || this.priority() !== 'all');

  visibleTasks = computed(() => {
    const query = this.search().trim().toLowerCase();
    const assignee = this.assignee();
    const priority = this.priority();
    return (this.sprint()?.tasks ?? []).filter((task) => {
      if (priority !== 'all' && task.priority !== priority) return false;
      if (assignee === 'none' && task.assignedTo) return false;
      if (typeof assignee === 'number' && task.assignedTo?.id !== assignee) return false;
      if (!query) return true;
      return (
        task.title.toLowerCase().includes(query) ||
        (task.description ?? '').toLowerCase().includes(query) ||
        task.tags.some((tag) => tag.name.toLowerCase().includes(query))
      );
    });
  });

  columns = computed(() =>
    this.statuses.map((status) => ({
      ...status,
      tasks: this.visibleTasks().filter((task) => task.status === status.value),
      total: (this.sprint()?.tasks ?? []).filter((task) => task.status === status.value).length,
    })),
  );

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    const id = Number(this.id());
    this.loading.set(true);
    this.notFound.set(false);
    forkJoin({ sprint: this.sprints.getSprint(id), members: this.sprints.getMembers(id) }).subscribe({
      next: ({ sprint, members }) => {
        this.sprint.set(sprint);
        this.members.set(members);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.assignee.set('all');
    this.priority.set('all');
  }

  setAssignee(value: string): void {
    this.assignee.set(value === 'all' || value === 'none' ? value : Number(value));
  }

  // ---- Drag and drop ------------------------------------------------------

  drop(event: CdkDragDrop<TaskStatus, TaskStatus, Task>): void {
    const task = event.item.data;
    const status = event.container.data;
    if (event.previousContainer === event.container || task.status === status) return;

    // The card moves at once; the request runs behind it and the move is undone if it fails.
    const previous = task.status;
    this.replaceTask({ ...task, status });
    this.tasks.updateStatus(task.id, status).subscribe({
      error: () => this.replaceTask({ ...task, status: previous }),
    });
  }

  // ---- Task dialog --------------------------------------------------------

  openNew(status: TaskStatus = 'TO_DO'): void {
    this.form.reset({ title: '', description: '', status, priority: 'MEDIUM', assigneeId: null });
    this.tags.set([]);
    this.tagDraft.set('');
    this.editing.set('new');
  }

  openTask(task: Task): void {
    this.form.reset({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      assigneeId: task.assignedTo?.id ?? null,
    });
    this.tags.set(task.tags.map((tag) => tag.name));
    this.tagDraft.set('');
    this.editing.set(task);
  }

  closeTask(): void {
    this.editing.set(null);
  }

  /** Enter or a comma turns the typed text into a tag. */
  onTagKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTag();
    } else if (event.key === 'Backspace' && !this.tagDraft() && this.tags().length) {
      this.tags.update((list) => list.slice(0, -1));
    }
  }

  addTag(): void {
    const name = this.tagDraft().trim().replace(/,$/, '').slice(0, 40);
    if (name && !this.tags().some((t) => t.toLowerCase() === name.toLowerCase())) {
      this.tags.update((list) => [...list, name]);
    }
    this.tagDraft.set('');
  }

  removeTag(name: string): void {
    this.tags.update((list) => list.filter((t) => t !== name));
  }

  saveTask(): void {
    const sprint = this.sprint();
    const editing = this.editing();
    if (!sprint || !editing) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.addTag(); // a tag still being typed counts too

    const value = this.form.getRawValue();
    const body: TaskInput = {
      title: value.title.trim(),
      description: value.description.trim(),
      status: value.status,
      priority: value.priority,
      assigneeId: value.assigneeId === null ? null : Number(value.assigneeId),
      sprintId: sprint.id,
      tags: this.tags(),
    };

    this.saving.set(true);
    const request = editing === 'new' ? this.tasks.addTask(body) : this.tasks.updateTask(editing.id, body);
    request.subscribe({
      next: (saved) => {
        if (editing === 'new') {
          this.sprint.set({ ...sprint, tasks: [...sprint.tasks, saved] });
          this.toast.success('Task added');
        } else {
          this.replaceTask(saved);
          this.toast.success('Task saved');
        }
        this.saving.set(false);
        this.editing.set(null);
      },
      error: () => this.saving.set(false),
    });
  }

  async deleteTask(task: Task): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Delete this task?',
      message: `"${task.title}" and its tags will be removed for everyone.`,
    });
    if (!ok) return;
    this.tasks.deleteTask(task.id).subscribe(() => {
      const sprint = this.sprint()!;
      this.sprint.set({ ...sprint, tasks: sprint.tasks.filter((t) => t.id !== task.id) });
      this.editing.set(null);
      this.toast.success('Task deleted');
    });
  }

  // ---- Sprint -------------------------------------------------------------

  onSprintSaved(sprint: Sprint): void {
    this.sprint.set(sprint);
    this.editingSprint.set(false);
    this.toast.success('Sprint updated');
  }

  async deleteSprint(): Promise<void> {
    const sprint = this.sprint();
    if (!sprint) return;
    const ok = await this.confirm.ask({
      title: 'Delete this sprint?',
      message: `"${sprint.name}" and its ${sprint.tasks.length} task(s) will be deleted.`,
    });
    if (!ok) return;
    this.sprints.deleteSprint(sprint.id).subscribe(() => {
      this.toast.success('Sprint deleted');
      this.router.navigate(['/projects', sprint.projectId]);
    });
  }

  editingTask(): Task | null {
    const editing = this.editing();
    return editing && editing !== 'new' ? editing : null;
  }

  private replaceTask(task: Task): void {
    const sprint = this.sprint();
    if (!sprint) return;
    this.sprint.set({ ...sprint, tasks: sprint.tasks.map((t) => (t.id === task.id ? task : t)) });
  }
}
