import { Component } from '@angular/core';
import { TasksService } from '../tasks.service';
import { OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [NgFor,CommonModule,HttpClientModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit {
  tasks: any[] = [];

  constructor(private taskService: TasksService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getAllTasks().subscribe(data => {
      this.tasks = data;
    });
  }
  addTask(): void {
    console.log('Add Task button clicked');
    // Implémenter la logique d'ajout de tâche
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
  
}