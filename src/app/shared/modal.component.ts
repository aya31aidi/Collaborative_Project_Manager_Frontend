import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { IconComponent } from './icon.component';

/**
 * Dialog with a title bar and projected content:
 *   <app-modal [open]="editing()" title="Edit task" (closed)="editing.set(false)"> ... </app-modal>
 * Escape and a click on the backdrop close it. Buttons go in a [modal-footer] element.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="backdrop" (click)="closed.emit()"></div>
      <section class="dialog card" [class.wide]="wide()" role="dialog" aria-modal="true" [attr.aria-label]="title()">
        <header>
          <h2>{{ title() }}</h2>
          <button type="button" class="icon-btn" (click)="closed.emit()" aria-label="Close">
            <app-icon name="x" [size]="18" />
          </button>
        </header>
        <div class="body"><ng-content /></div>
        <footer><ng-content select="[modal-footer]" /></footer>
      </section>
    }
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 80;
        background: rgba(10, 12, 18, 0.45);
        backdrop-filter: blur(2px);
        animation: fade 0.15s ease-out;
      }
      .dialog {
        position: fixed;
        z-index: 81;
        top: 50%;
        left: 50%;
        display: flex;
        flex-direction: column;
        width: min(480px, calc(100vw - 32px));
        max-height: calc(100vh - 48px);
        translate: -50% -50%;
        box-shadow: var(--shadow-lg);
        animation: pop 0.18s cubic-bezier(0.2, 0.9, 0.3, 1.2);
      }
      .dialog.wide {
        width: min(640px, calc(100vw - 32px));
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 16px 4px 22px;
      }
      .body {
        overflow-y: auto;
        padding: 14px 22px 4px;
      }
      footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 16px 22px 20px;
      }
      footer:empty {
        display: none;
      }
      @keyframes fade {
        from {
          opacity: 0;
        }
      }
      @keyframes pop {
        from {
          opacity: 0;
          scale: 0.97;
        }
      }
    `,
  ],
})
export class ModalComponent {
  private host = inject(ElementRef<HTMLElement>);

  open = input(false);
  title = input('');
  wide = input(false);
  closed = output<void>();

  constructor() {
    effect(() => {
      const open = this.open();
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        // Focus the first field once the content has rendered.
        setTimeout(() => {
          const el = this.host.nativeElement.querySelector('[autofocus], input, textarea, select') as HTMLElement | null;
          el?.focus();
        });
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.closed.emit();
  }
}
