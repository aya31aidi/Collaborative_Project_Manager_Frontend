import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Sprint } from '../core/models';
import { SprintService } from '../core/services/sprints.service';
import { addDays, toDayString, today } from '../core/sprint-utils';
import { ModalComponent } from './modal.component';

function endAfterStart(group: AbstractControl): ValidationErrors | null {
  const { startDate, endDate } = group.value as { startDate: string; endDate: string };
  return startDate && endDate && endDate < startDate ? { endBeforeStart: true } : null;
}

/**
 * Create or edit a sprint in a dialog. Without [sprint] it creates one in
 * [projectId], starting today and lasting two weeks by default.
 */
@Component({
  selector: 'app-sprint-form',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [open]="open()" [title]="sprint() ? 'Edit sprint' : 'New sprint'" (closed)="closed.emit()">
      <form class="form" [formGroup]="form" (ngSubmit)="save()" id="sprint-form">
        <div class="field">
          <label for="sprint-name">Name</label>
          <input id="sprint-name" class="input" formControlName="name" placeholder="Sprint 4 · Checkout" />
          @if (form.controls.name.touched && form.controls.name.invalid) {
            <span class="error">A sprint needs a name.</span>
          }
        </div>
        <div class="form-row">
          <div class="field">
            <label for="sprint-start">Starts</label>
            <input id="sprint-start" type="date" class="input" formControlName="startDate" />
          </div>
          <div class="field">
            <label for="sprint-end">Ends</label>
            <input id="sprint-end" type="date" class="input" formControlName="endDate" />
          </div>
        </div>
        @if (form.errors?.['endBeforeStart']) {
          <span class="error small">The end date comes before the start date.</span>
        }
      </form>
      <div modal-footer>
        <button type="button" class="btn" (click)="closed.emit()">Cancel</button>
        <button type="submit" form="sprint-form" class="btn btn-primary" [disabled]="saving()">
          {{ sprint() ? 'Save changes' : 'Create sprint' }}
        </button>
      </div>
    </app-modal>
  `,
  styles: ['.error { color: var(--danger); font-size: 12px; }'],
})
export class SprintFormComponent {
  private fb = inject(FormBuilder);
  private sprints = inject(SprintService);

  open = input(false);
  projectId = input<number | null>(null);
  sprint = input<Sprint | null>(null);
  saved = output<Sprint>();
  closed = output<void>();

  saving = signal(false);

  form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.maxLength(255)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    },
    { validators: endAfterStart },
  );

  constructor() {
    // Fresh values every time the dialog opens.
    effect(() => {
      if (!this.open()) return;
      const sprint = untracked(this.sprint);
      const start = today();
      this.form.reset(
        sprint
          ? { name: sprint.name, startDate: sprint.startDate, endDate: sprint.endDate }
          : { name: '', startDate: toDayString(start), endDate: toDayString(addDays(start, 13)) },
      );
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const body = { ...value, name: value.name.trim() };
    const sprint = this.sprint();
    const request = sprint
      ? this.sprints.updateSprint(sprint.id, body)
      : this.sprints.createSprint(this.projectId()!, body);

    this.saving.set(true);
    request.subscribe({
      next: (result) => {
        this.saving.set(false);
        // An update answers with the sprint's tasks too, so the board can keep them.
        this.saved.emit(result);
      },
      error: () => this.saving.set(false),
    });
  }
}
