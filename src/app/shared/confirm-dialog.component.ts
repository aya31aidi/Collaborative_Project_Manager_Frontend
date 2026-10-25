import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmService } from '../core/confirm.service';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [open]="!!confirm.request()" [title]="confirm.request()?.title ?? ''" (closed)="answer(false)">
      <p class="muted">{{ confirm.request()?.message }}</p>
      <div modal-footer>
        <button type="button" class="btn" (click)="answer(false)">Cancel</button>
        <button
          type="button"
          class="btn"
          [class.btn-danger-solid]="confirm.request()?.danger"
          [class.btn-primary]="!confirm.request()?.danger"
          (click)="answer(true)"
        >
          {{ confirm.request()?.confirmLabel }}
        </button>
      </div>
    </app-modal>
  `,
})
export class ConfirmDialogComponent {
  confirm = inject(ConfirmService);

  answer(ok: boolean): void {
    this.confirm.request()?.resolve(ok);
  }
}
