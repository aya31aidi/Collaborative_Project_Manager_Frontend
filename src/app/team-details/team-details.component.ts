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
      },
      (error) => {
        console.error('Error fetching team details:', error);
      }
    );
  }

}