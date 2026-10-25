import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from './core/theme.service';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';
import { IconComponent, IconName } from './shared/icon.component';
import { ToastHostComponent } from './shared/toast-host.component';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
  exact?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, ToastHostComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  theme = inject(ThemeService);
  menuOpen = signal(false);

  readonly nav: NavItem[] = [
    { path: '/', label: 'Overview', icon: 'dashboard', exact: true },
    { path: '/projects', label: 'Projects', icon: 'folder' },
    { path: '/tasks', label: 'All tasks', icon: 'tasks' },
    { path: '/teams', label: 'Teams', icon: 'users' },
    { path: '/people', label: 'People', icon: 'user' },
  ];

  constructor() {
    // The phone menu closes itself after a navigation.
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));
  }
}
