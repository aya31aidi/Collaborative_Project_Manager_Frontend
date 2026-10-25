import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Team } from '../../core/models';
import { TeamsService } from '../../core/services/teams.service';
import { ToastService } from '../../core/toast.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent, AvatarComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.css',
})
export class TeamsComponent implements OnInit {
  private teamsService = inject(TeamsService);
  private toast = inject(ToastService);
  private router = inject(Router);

  teams = signal<Team[]>([]);
  loading = signal(true);
  creating = signal(false);
  saving = signal(false);
  newName = '';

  ngOnInit(): void {
    this.teamsService.getAllTeams().subscribe({
      next: (teams) => {
        this.teams.set(teams);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.newName = '';
    this.creating.set(true);
  }

  create(): void {
    const name = this.newName.trim();
    if (!name) return;
    this.saving.set(true);
    this.teamsService.createTeam(name).subscribe({
      next: (team) => {
        this.saving.set(false);
        this.creating.set(false);
        this.toast.success('Team created, now add its members');
        this.router.navigate(['/teams', team.id]);
      },
      error: () => this.saving.set(false),
    });
  }
}
