import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { SprintService } from '../sprints.service';
import { TasksService } from '../tasks.service';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { KanbanModule } from '@syncfusion/ej2-angular-kanban';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef } from '@angular/core';
import { CapitalizePipe } from '../capitalize.pipe';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule ,FormBuilder, FormGroup, Validators} from '@angular/forms';
@Component({
  selector: 'app-sprint-details',
  standalone: true,
  imports: [NgFor,CommonModule,KanbanModule,DragDropModule,ReactiveFormsModule,NgClass],
  templateUrl: './sprint-details.component.html',
  styleUrl: './sprint-details.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class SprintDetailsComponent implements OnInit {
  sprintData: any;
  addTaskForm!: FormGroup;
  kanbanColumns = [
    { headerText: 'To Do', keyField: 'TO_DO' },
    { headerText: 'In Progress', keyField: 'IN_PROGRESS' },
    { headerText: 'Done', keyField: 'DONE' }
  ];
  connectedColumns = ['TO_DO', 'IN_PROGRESS', 'DONE']; // Connecter toutes les colonnes

  constructor(private route: ActivatedRoute, private sprintService: SprintService,private cdr: ChangeDetectorRef,
     private tasksService: TasksService,
     private fb: FormBuilder  // Add FormBuilder here
  ) {}

     ngOnInit(): void {
      const sprintId = Number(this.route.snapshot.paramMap.get('id'));
      this.loadSprintData(sprintId);
      
      // Initialiser le formulaire pour ajouter une tâche
      this.addTaskForm = this.fb.group({
        title: ['', [Validators.required]],
        description: ['', []],
        priority: ['', [Validators.required]],
        assignedTo: ['', []]
      });
    }

  loadSprintData(sprintId: number): void {
    this.sprintService.getSprintById(sprintId).subscribe(
      (data) => {
        this.sprintData = data;
        this.processTags();
        this.cdr.detectChanges(); // Force la détection des changements après le chargement des données
      },
      (error) => {
        console.error('Error fetching sprint data', error);
      }
    );
  }


  processTags(): void {
    this.sprintData.tasks.forEach((task: any) => {
      task.tagsList = task.tags.map((tag: any) => tag.name); // Garde un tableau des noms

    });
  }

  getTasksForColumn(status: string): any[] {
    return this.sprintData.tasks.filter((task: any) => task.status === status);
  }

  onTaskDropped(event: CdkDragDrop<any[]>): void {
    const task = event.item.data; // Get the task that was dropped
    const newStatus = event.container.id; // Use the container's ID as the new status
    const previousStatus = task.status;

    task.status = newStatus;
  
    this.sprintService.updateTaskStatus(task.id, newStatus).subscribe(
      () => {
        console.log('Task status updated successfully');
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);

      },
      
      (error) => {
        console.error('Error updating task status', error);
        task.status = previousStatus; // Revert status if there's an error
      }
    );
  }
  
  
  editTask(task: any): void {
    console.log('Edit Task:', task);
    // Implémenter la logique de modification de tâche
  }
  
  attachFileToTask(task: any): void {
    console.log('Attach file to Task:', task);
    // Implémenter la logique de joindre un fichier
  }
  
  deleteTask(task: any): void {
    if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      console.log('Delete Task:', task);
      // Implémenter la logique de suppression de tâche
    }
  }
  
  addTask(task: any): void {
    this.tasksService.addTask(task).subscribe(
      (newTask) => {
        this.sprintData.tasks.push(newTask); // Ajouter la nouvelle tâche au tableau existant
      },
      (error) => {
        console.error('Error adding task', error);
      }
    );
  }
  
  onAddTaskSubmit(): void {
    if (this.addTaskForm.valid) {
      const taskData = this.addTaskForm.value; // Récupérer les données du formulaire
      this.tasksService.addTask(taskData).subscribe(
        (newTask) => {
          this.sprintData.tasks.push(newTask); // Ajouter la tâche localement
          this.addTaskForm.reset(); // Réinitialiser le formulaire
          alert('Task added successfully!');
        },
        (error) => {
          console.error('Error adding task', error);
        }
      );
    } else {
      alert('Please fill in all required fields.');
    }
  }
 
}