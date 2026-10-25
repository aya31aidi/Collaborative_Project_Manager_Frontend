import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, TaskInput, TaskStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/tasks`;

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.url);
  }

  addTask(task: TaskInput): Observable<Task> {
    return this.http.post<Task>(this.url, task);
  }

  updateTask(id: number, task: TaskInput): Observable<Task> {
    return this.http.put<Task>(`${this.url}/${id}`, task);
  }

  updateStatus(id: number, status: TaskStatus): Observable<Task> {
    return this.http.put<Task>(`${this.url}/${id}/status`, { status });
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
