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
import { HttpHeaders,HttpClient } from '@angular/common/http';
import { UserService } from '../users.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray } from '@angular/forms';
import { TagsService } from '../tags.service';
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
  usersList: any[] = []; // Déclarer usersList ici
  users: any[] = [];
  tasks: any[] = [];

  constructor(private route: ActivatedRoute, private sprintService: SprintService,private cdr: ChangeDetectorRef,
     private tasksService: TasksService,
     private fb: FormBuilder ,
     private http: HttpClient ,
     private modalService: NgbModal,
     private tagsService :TagsService
  ) {}

  ngOnInit(): void {
    // Get sprintId from the route params
    const sprintId = Number(this.route.snapshot.paramMap.get('id')); // Assuming 'id' is the route parameter
    this.loadSprintData(sprintId); // Optional, for loading data based on sprintId

    // Load other necessary data
    this.loadUsers(); // Charger les utilisateurs pour le sprint

    // Initialize the form and set sprintId
    this.addTaskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', []],
      priority: ['', [Validators.required]],
      assignedTo: ['', []],
      status: ['', [Validators.required]],
      sprintId: [sprintId, [Validators.required]], // Set the sprintId value here
      tags: this.fb.array([])
    });
  }
  get tags() {
    return this.addTaskForm?.get('tags') as FormArray;
  }
  
  
  addTag(): void {
    this.tags.push(this.fb.control('')); // Add an empty string for the tag input
  }
  
  removeTag(index: number): void {
    this.tags.removeAt(index); // Remove tag at the specified index
  }
  

  loadSprintData(sprintId: number): void {
    this.sprintService.getSprintById(sprintId).subscribe(
      (data) => {
        this.sprintData = data;
        this.processTags();
        this.cdr.detectChanges(); 

      },
      (error) => {
        console.error('Error fetching sprint data', error);
      }
    );
  }

  processTags(): void {
    if (this.sprintData && this.sprintData.tasks) {
      this.sprintData.tasks.forEach((task: any) => {
        this.tasksService.getTagsByTaskId(task.id).subscribe(
          (tags) => {
            task.tagsList = tags ? tags.map((tag: any) => tag.name) : [];
            this.cdr.detectChanges(); 
          },
          (error) => {
            console.error(`Error fetching tags for task ${task.id}`, error);
            task.tagsList = []; 
          }
        );
      });
    } else {
      console.error('No tasks found in sprintData');
    }
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
        console.log('Task status updated successfully')

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
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
   this.tasksService.addTask(task)
      .subscribe(
        (newTask) => {
          this.sprintData.tasks.push(newTask); // Ajout de la nouvelle tâche à la liste
          console.log(newTask);
        },
        (error) => {
          console.error('Error adding task', error);
        }
      );
  }
  
    onSubmit(): void {
      if (this.addTaskForm.valid ) {
        const formValue = this.addTaskForm.value;
        
        // Formater les tags
        const formattedTags = this.tags.controls.map(tagControl => tagControl.value);
        
        // Créer la tâche
        const taskData = {
          ...formValue,
          assignedTo: { id: formValue.assignedTo },
          sprint: { id: formValue.sprintId }, 
          tags: formattedTags
        };
        
        console.log("tags:", taskData.tags);
    
        // Ajouter la tâche au backend
        this.tasksService.addTask(taskData).subscribe(
          (newTask) => {
            console.log('Task created successfully', newTask);
            
            // Ajouter les tags à la tâche
            formattedTags.forEach((tagName: string) => {
              const tagData = { name: tagName, taskId: newTask.id };
              this.tagsService.addTag(tagData).subscribe(
                () => {
                  console.log('Tag added successfully:', tagName);
                },
                (error) => {
                  console.error('Error adding tag:', tagName, error);
                }
              );
            });
            
            this.modalService.dismissAll(); // Fermer le modal
            console.log('taskData:', taskData);
          },
          (error) => {
            console.error('Error creating task', error);
          }
        );
      }
    }
    
    
  onCancel() {
    this.addTaskForm.reset(); // Réinitialiser le formulaire
    this.modalService.dismissAll(); // Fermer le modal
  }
  loadUsersFromProject(): void {
    // Extract users from all teams involved in the project
    const project = this.sprintData.project; // Assuming sprintData contains the project info

    project.teams.forEach((team: any) => {
      this.users = [...this.users, ...team.users]; // Collect users from each team
    });
  }
  loadUsersForSprint(sprintId: number): void {
    this.sprintService.getSprintById(sprintId).subscribe(
      (data) => {
        this.sprintData = data;
        this.processTags();
        this.usersList = this.getUsersFromTeams(data); // Récupérer les utilisateurs des équipes du projet
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching sprint data', error);
      }
    );
  }
  
  loadUsers(): void {
    const sprintId = Number(this.route.snapshot.paramMap.get('id'));
    this.sprintService.getUsersForSprint(sprintId).subscribe(
      (users) => {
        // Supprimez les doublons basés sur l'ID
        this.usersList = users.filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.id === user.id)
        );
        if (!this.usersList || this.usersList.length === 0) {
          console.error('No users found for this sprint!');
        }
      },
      (error) => {
        console.error('Error fetching users', error);
      }
    );
  }
  
  getUsersFromTeams(sprintData: any): any[] {
    const users: any[] = [];  // `users` est aussi de type `any[]`
    sprintData.project.teams.forEach((team: any) => {
      team.users.forEach((user: any) => {
        users.push(user);
      });
    });
    return users;
  }
  
}