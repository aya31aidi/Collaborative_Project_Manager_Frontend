import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { SprintService } from '../sprints.service';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { KanbanModule } from '@syncfusion/ej2-angular-kanban';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef } from '@angular/core';
import { CapitalizePipe } from '../capitalize.pipe';
@Component({
  selector: 'app-sprint-details',
  standalone: true,
  imports: [NgFor,CommonModule,KanbanModule,DragDropModule,CapitalizePipe],
  templateUrl: './sprint-details.component.html',
  styleUrl: './sprint-details.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class SprintDetailsComponent implements OnInit {
  sprintData: any;
  kanbanColumns = [
    { headerText: 'To Do', keyField: 'TO_DO' },
    { headerText: 'In Progress', keyField: 'IN_PROGRESS' },
    { headerText: 'Done', keyField: 'DONE' }
  ];
  connectedColumns = ['TO_DO', 'IN_PROGRESS', 'DONE']; // Connecter toutes les colonnes

  constructor(private route: ActivatedRoute, private sprintService: SprintService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const sprintId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSprintData(sprintId);
  }

  loadSprintData(sprintId: number): void {
    this.sprintService.getSprintById(sprintId).subscribe(
      (data) => {
        this.sprintData = data;
        this.processTags();
      },
      (error) => {
        console.error('Error fetching sprint data', error);
      }
    );
  }

  processTags(): void {
    this.sprintData.tasks.forEach((task: any) => {
      task.tagsList = task.tags.map((tag: any) => tag.name).join(', ');
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
  
  
  
}