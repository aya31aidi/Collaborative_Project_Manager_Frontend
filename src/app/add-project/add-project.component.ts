import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../project.service';
import { NgFor } from '@angular/common';
import { UserService } from '../users.service';
import { TeamsService } from '../teams.service';
@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [FormsModule,RouterLink,NgFor],
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.css',
})
export class AddProjectComponent {
  project = { name: '', description: '',
    team: [] as { id: number; name: string; members: any[] }[]
  };
  teamId: number = 0;
  selectedUser: any = null; 
  constructor(private router: Router,private projectService:ProjectService, private userService:UserService,
    private teamsService:TeamsService
  ) {}
  users: any[] = []; 
  teamMembers: any[] = []; 
  teamName = '';
  ngOnInit(): void {
   // this.projectService.getUsers().subscribe((data) => {
    //  this.users = data;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      },
    });
    };
  
    addUserToTeam(): void {
      if (this.selectedUser && this.teamName) {
        // Vérifier si l'équipe a déjà été créée
        if (!this.project.team.some(team => team.name === this.teamName)) {
          // Créer une nouvelle équipe si elle n'existe pas
          this.teamsService.createTeam({ name: this.teamName }).subscribe((teamId: number) => {
            const newTeam = { id: teamId, name: this.teamName, members: [] };
            this.project.team.push(newTeam);
            this.addUserToExistingTeam(teamId);  // Ajouter l'utilisateur à l'équipe existante
          });
        } else {
          // Si l'équipe existe déjà, récupérer l'ID de l'équipe
          const existingTeam = this.project.team.find(team => team.name === this.teamName);
          if (existingTeam) {
            this.addUserToExistingTeam(existingTeam.id);  // Ajouter l'utilisateur à l'équipe existante
          }
        }
      } else {
        alert('Please select a user and enter a team name.');
      }
    }
    
    
    addUserToExistingTeam(teamId: number): void {
      this.teamsService.addUserToTeam(teamId, this.selectedUser.id).subscribe(() => {
        // Ajouter l'utilisateur à l'équipe locale
        const team = this.project.team.find(team => team.id === teamId);
        if (team) {
          team.members.push(this.selectedUser);
        }
        this.teamMembers.push(this.selectedUser);  // Ajouter à la liste locale des membres
        this.resetTeamForm();
      });
    }
    
    resetTeamForm(): void {
      this.selectedUser = null;  // Reset the selected user
      this.teamName = '';  // Reset the team name
    }
  
  removeUserFromTeam(member: any): void {
    this.project.team = this.project.team.filter((user) => user !== member);
  }

  addProject(): void {
    if (this.project.team.length > 0 && this.project.name && this.project.description) {
      // Assurez-vous que l'ID du projet est géré par le backend
      const teamId = this.project.team[0].id;
      
      // Créez un projet sans ID si le backend gère la génération de l'ID
      const projectData = { 
        name: this.project.name, 
        description: this.project.description, 
      };
      
      this.projectService.addProject(teamId,projectData).subscribe({
        next: (response) => {
          console.log('Project added successfully:', response);
          this.router.navigate(['/projects']);
        },
        error: (err) => {
          console.error('Error adding project:', err);
        }
      });
    } else {
      alert('Please fill in all project details and add a team.');
    }
  }
  
  
  
  addTeamToProject(): void {
    if (this.teamName && this.teamMembers.length > 0) {
      const newTeam = { id: 0, name: this.teamName, members: this.teamMembers }; 
      this.project.team.push(newTeam); // Ajouter l'équipe au projet
      this.teamName = ''; // Réinitialiser le nom de l'équipe
      this.teamMembers = []; // Réinitialiser les membres
    } else {
      alert('Please provide a team name and add members.');
    }
  }
}
