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
}