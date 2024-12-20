import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { Sprint } from './sprints.service';
import { User } from './users.service';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  sprint: Sprint;
  assignedTo: User;
} 
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private apiUrl = 'http://localhost:8070/tasks'; // Replace with your backend API URL

  constructor(private http: HttpClient) { }

  getAllTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

 /* addTask(task: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, task, { headers });
  }*/
  addTask(task: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, task);
  }

  updateTask(id: number, task: any): Observable<Task> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, task);
  }
  
  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}`);
  }
  getTagsByTaskId(taskId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8070/tags/task/${taskId}`);
  }
  
}
