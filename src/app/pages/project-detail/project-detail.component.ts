import { ChangeDetectionStrategy, Component, OnChanges, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmService } from '../../core/confirm.service';
import { Project, Sprint } from '../../core/models';
import { ProjectService } from '../../core/services/project.service';
import { STATE_LABEL, formatRange, progressOf, sprintNote, sprintState } from '../../core/sprint-utils';
import { ToastService } from '../../core/toast.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';
import { SprintFormComponent } from '../../shared/sprint-form.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, IconComponent, AvatarComponent, ModalComponent, SprintFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
})
export class ProjectDetailComponent implements OnChanges {
  private projectService = inject(ProjectService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  /** Route parameter :id */
  id = input.required<string>();

  readonly stateLabel = STATE_LABEL;

  project = signal<Project | null>(null);
  loading = signal(true);
  notFound = signal(false);
  editing = signal(false);
  addingSprint = signal(false);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', Validators.maxLength(255)],
  });

  progress = computed(() => progressOf(this.project()?.sprints.flatMap((s) => s.tasks) ?? []));

  sprints = computed(() =>
    (this.project()?.sprints ?? []).map((sprint) => {
      const state = sprintState(sprint);
      return { sprint, state, range: formatRange(sprint), progress: progressOf(sprint.tasks), note: sprintNote(sprint) };
    }),
  );

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.projectService.getProject(Number(this.id())).subscribe({
      next: (project) => {
        this.project.set(project);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
  }

  openEdit(): void {
    const project = this.project()!;
    this.form.reset({ name: project.name, description: project.description ?? '' });
    this.editing.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.projectService
      .updateProject(this.project()!.id, { name: value.name.trim(), description: value.description.trim() })
      .subscribe({
        next: (project) => {
          this.project.set(project);
          this.saving.set(false);
          this.editing.set(false);
          this.toast.success('Project saved');
        },
        error: () => this.saving.set(false),
      });
  }

  async remove(): Promise<void> {
    const project = this.project()!;
    const ok = await this.confirm.ask({
      title: 'Delete this project?',
      message: `"${project.name}", its ${project.sprints.length} sprint(s) and all their tasks will be deleted. The team stays.`,
      confirmLabel: 'Delete project',
    });
    if (!ok) return;
    this.projectService.deleteProject(project.id).subscribe(() => {
      this.toast.success('Project deleted');
      this.router.navigate(['/projects']);
    });
  }

  onSprintCreated(sprint: Sprint): void {
    this.addingSprint.set(false);
    this.toast.success('Sprint created');
    this.router.navigate(['/sprints', sprint.id]);
  }
}
