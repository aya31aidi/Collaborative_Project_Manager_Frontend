import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ConfirmService } from '../../core/confirm.service';
import { Team, User, UserInput } from '../../core/models';
import { TeamsService } from '../../core/services/teams.service';
import { UserService } from '../../core/services/users.service';
import { ToastService } from '../../core/toast.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, IconComponent, AvatarComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './people.component.html',
  styleUrl: './people.component.css',
})
export class PeopleComponent implements OnInit {
  private userService = inject(UserService);
  private teamsService = inject(TeamsService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  teams = signal<Team[]>([]);
  loading = signal(true);
  search = signal('');

  // null = dialog closed, 'new' = creating, a User = editing them.
  editing = signal<User | 'new' | null>(null);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(255)]],
    username: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    role: ['', Validators.maxLength(255)],
    password: [''],
  });

  /** The teams each person belongs to, by user id. */
  teamsOf = computed(() => {
    const map = new Map<number, Team[]>();
    for (const team of this.teams()) {
      for (const user of team.users) {
        map.set(user.id, [...(map.get(user.id) ?? []), team]);
      }
    }
    return map;
  });

  visible = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.users()
      .filter(
        (u) =>
          !query ||
          u.fullName.toLowerCase().includes(query) ||
          u.username.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          (u.role ?? '').toLowerCase().includes(query),
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  });

  ngOnInit(): void {
    forkJoin({ users: this.userService.getAllUsers(), teams: this.teamsService.getAllTeams() }).subscribe({
      next: ({ users, teams }) => {
        this.users.set(users);
        this.teams.set(teams);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openNew(): void {
    this.form.reset({ fullName: '', username: '', email: '', role: '', password: '' });
    this.editing.set('new');
  }

  openEdit(user: User): void {
    this.form.reset({ fullName: user.fullName, username: user.username, email: user.email, role: user.role ?? '', password: '' });
    this.editing.set(user);
  }

  /** A username suggestion from the full name, until one is typed by hand. */
  suggestUsername(): void {
    const username = this.form.controls.username;
    if (this.editing() !== 'new' || username.dirty) return;
    const parts = this.form.controls.fullName.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const suggestion = parts.length > 1 ? `${parts[0]}.${parts[parts.length - 1][0]}` : (parts[0] ?? '');
    username.setValue(suggestion.normalize('NFD').replace(/[^a-z0-9._-]/g, ''));
  }

  save(): void {
    const editing = this.editing();
    if (!editing) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const body: UserInput = {
      fullName: value.fullName.trim(),
      username: value.username.trim(),
      email: value.email.trim(),
      role: value.role.trim(),
      ...(value.password ? { password: value.password } : {}),
    };

    this.saving.set(true);
    const request = editing === 'new' ? this.userService.createUser(body) : this.userService.updateUser(editing.id, body);
    request.subscribe({
      next: (saved) => {
        this.users.update((list) =>
          editing === 'new' ? [...list, saved] : list.map((u) => (u.id === saved.id ? saved : u)),
        );
        this.saving.set(false);
        this.editing.set(null);
        this.toast.success(editing === 'new' ? `${saved.fullName} added` : 'Changes saved');
      },
      error: () => this.saving.set(false),
    });
  }

  async remove(user: User): Promise<void> {
    const ok = await this.confirm.ask({
      title: `Remove ${user.fullName}?`,
      message: 'They leave every team, and their tasks become unassigned. The tasks themselves stay.',
      confirmLabel: 'Remove',
    });
    if (!ok) return;
    this.userService.deleteUser(user.id).subscribe(() => {
      this.users.update((list) => list.filter((u) => u.id !== user.id));
      this.teams.update((list) => list.map((t) => ({ ...t, users: t.users.filter((u) => u.id !== user.id) })));
      this.toast.success(`${user.fullName} removed`);
    });
  }

  isNew(): boolean {
    return this.editing() === 'new';
  }
}
