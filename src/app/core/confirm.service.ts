import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  resolve: (ok: boolean) => void;
}

/**
 * Promise-based replacement for window.confirm(), rendered by the confirm
 * dialog in the app shell:
 *   if (await this.confirm.ask({ title: 'Delete?', message: '...' })) { ... }
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly request = signal<ConfirmRequest | null>(null);

  ask(options: { title: string; message: string; confirmLabel?: string; danger?: boolean }): Promise<boolean> {
    return new Promise((resolve) => {
      this.request.set({
        confirmLabel: 'Delete',
        danger: true,
        ...options,
        resolve: (ok) => {
          this.request.set(null);
          resolve(ok);
        },
      });
    });
  }
}
