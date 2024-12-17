import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { TeamsService } from '../teams.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './team-details.component.html',
  styleUrl: './team-details.component.css',
})
export class TeamDetailsComponent implements OnInit {
  teamId!: number;
  team: any; // Replace with your team interface
  project: any; 
  constructor(
    private route: ActivatedRoute,
    private teamsService: TeamsService // Inject the service
  ) {}

  ngOnInit(): void {
    // Get the ID from the route
    this.teamId = +this.route.snapshot.paramMap.get('id')!;
  
    // Fetch the team details using the service
    this.teamsService.getTeamById(this.teamId).subscribe(
      (team) => {
        this.team = team;
  
        // Fetch the users associated with the team
        this.teamsService.getUsersByTeamId(this.teamId).subscribe(
          (users: any) => {
            this.team.users = users; // Populate the users in the team object
          },
          (error: any) => {
            console.error('Error fetching users:', error);
          }
        );
  
        // Fetch the project associated with the team
        this.teamsService.getProjectByTeamId(this.teamId).subscribe(
          (project: any) => {
            this.team.project = project;
          },
          (error: any) => {
            console.error('Error fetching project details:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching team details:', error);
      }
    );
  }
  /*deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.teamsService.deleteUser(this.teamId,userId).subscribe(
        (response) => {
          // Retirer l'utilisateur supprimé de la liste locale
          this.team.users = this.team.users.filter((user: any) => user.id !== userId);
          alert('User deleted successfully!');
        },
        (error) => {
          console.error('Error deleting user:', error);
          alert('There was an error deleting the user.');
        }
      );
    }
  }*/
    deleteUserFromTeam(teamId: number, userId: number): void {
      if (confirm('Are you sure you want to delete this user from the team?')) {
        this.teamsService.deleteUserFromTeam(teamId, userId).subscribe(
          (response: any) => {
            console.log('Response from server:', response.message); // Utiliser la clé "message"
            alert(response.message);
            this.reloadUsers();
          },
          (error) => {
            console.error('Error deleting user:', error);
            alert('There was an error deleting the user.');
          }
        );
      }
    }
    
    reloadUsers(): void {
      this.teamsService.getUsersByTeamId(this.teamId).subscribe(
        (users: any) => {
          this.team.users = users; // Met à jour la liste des utilisateurs
        },
        (error: any) => {
          console.error('Error fetching updated users:', error);
        }
      );
    }
    loadTeamDetails(): void {
      // Recharger les détails de l'équipe, y compris les utilisateurs et le projet
      this.teamsService.getTeamById(this.teamId).subscribe(
        (team) => {
          this.team = team;
    
          // Recharger les utilisateurs associés à l'équipe
          this.teamsService.getUsersByTeamId(this.teamId).subscribe(
            (users: any) => {
              this.team.users = users;
            },
            (error: any) => {
              console.error('Error fetching users:', error);
            }
          );
    
          // Recharger le projet associé à l'équipe
          this.teamsService.getProjectByTeamId(this.teamId).subscribe(
            (project: any) => {
              this.team.project = project;
            },
            (error: any) => {
              console.error('Error fetching project details:', error);
            }
          );
        },
        (error) => {
          console.error('Error fetching team details:', error);
        }
      );
    }
    
    
}