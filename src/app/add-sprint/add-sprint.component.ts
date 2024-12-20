import { Component ,OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SprintService } from '../sprints.service';
import { ProjectService } from '../project.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-add-sprint',
  standalone: true,
  imports: [FormsModule,NgIf],
  templateUrl: './add-sprint.component.html',
  styleUrl: './add-sprint.component.css'
})
export class AddSprintComponent implements OnInit {
  projectId!:  number; // ID du projet
  sprintName: string = ''; // Nom du sprint
  startDate: string = '';
endDate: string = '';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sprintService: SprintService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du projet depuis l'URL
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.startDate = this.formatDate(new Date()); // Date actuelle au format ISO
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14); // 2 semaines après
  this.endDate = this.formatDate(twoWeeksLater); // Date de fin au bon format
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  addSprint(): void {
    console.log('Add Sprint button clicked');
    console.log(this.sprintName,this.startDate,this.endDate);

    if (this.sprintName && this.startDate && this.endDate) {
      const newSprint = {
        name: this.sprintName,
        startDate: new Date(this.startDate), 
        endDate: new Date(this.endDate),
      };      
      
      console.log('Sending sprint data:', newSprint); // Ajout de log pour vérifier les données envoyées
  
      this.sprintService.createSprint(this.projectId, newSprint).subscribe(
        (response) => {
          console.log('Sprint added successfully');
          this.router.navigate(['/projects']); // Rediriger vers la liste des projets
        },
        (error) => {
          console.error('Error adding sprint:', error);
        }
      );
    } 
  }
}