import { Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

/** Light/dark switch, saved per browser. index.html applies it before the first paint. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light');

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    document.documentElement.dataset['theme'] = next;
    try {
      localStorage.setItem('pm.theme', next);
    } catch {
      // Private mode or blocked storage: the switch still works for this visit.
    }
  }
}
