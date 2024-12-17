import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { TeamsService } from '../teams.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule,HttpClientModule,RouterLink],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.css'
})
export class TeamsComponent implements OnInit {
  teams:  any[] = [];

  constructor(private teamService: TeamsService,private router :Router) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.teamService.getAllTeams().subscribe(
      (data) => {
        // For each team, fetch the project name
        data.forEach((team: any) => {
          this.teamService.getProjectByTeamId(team.id).subscribe(
            (project: any) => {
              team.projectName = project.name; // Add project name to the team
            },
            (error: any) => {
              console.error('Error fetching project:', error);
            }
          );
        });
        this.teams = data; // Store the teams data
      },
      (error) => {
        console.error('Error fetching teams:', error);
      }
    );
  }
  editTeam(teamId: number): void {
    this.router.navigate(['/teams/edit', teamId]);
  }

  // Handle the delete action
  deleteTeam(teamId: number): void {
    if (confirm('Are you sure you want to delete this team?')) {
      this.teamService.deleteTeam(teamId).subscribe(
        () => {
          // Remove the deleted team from the list
          this.teams = this.teams.filter(team => team.id !== teamId);
        },
        (error) => {
          console.error('Error deleting team:', error);
        }
      );
    }
  }
}