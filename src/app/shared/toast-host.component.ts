import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack" aria-live="polite">
      @for (toast of toasts.toasts(); track toast.id) {
        <div class="toast" [class.error]="toast.kind === 'error'" role="status">
          <app-icon [name]="toast.kind === 'error' ? 'alert' : 'check'" [size]="16" />
          <span>{{ toast.text }}</span>
          <button type="button" class="icon-btn" (click)="toasts.dismiss(toast.id)" aria-label="Dismiss">
            <app-icon name="x" [size]="14" />
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .stack {
        position: fixed;
        z-index: 100;
        right: 20px;
        bottom: 20px;
        display: grid;
        gap: 8px;
        width: min(380px, calc(100vw - 40px));
      }
      .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 8px 8px 14px;
        border-radius: var(--radius);
        background: var(--ink);
        color: var(--bg);
        box-shadow: var(--shadow-lg);
        font-weight: 500;
        animation: slide 0.2s ease-out;
      }
      .toast app-icon {
        color: var(--done);
      }
      .toast.error app-icon {
        color: var(--high);
      }
      .toast span {
        flex: 1;
      }
      .toast .icon-btn {
        width: 26px;
        height: 26px;
        color: inherit;
        opacity: 0.6;
      }
      .toast .icon-btn:hover {
        background: transparent;
        color: inherit;
        opacity: 1;
      }
      @keyframes slide {
        from {
          opacity: 0;
          translate: 0 8px;
        }
      }
    `,
  ],
})
export class ToastHostComponent {
  toasts = inject(ToastService);
}
