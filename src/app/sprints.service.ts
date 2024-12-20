import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from './project.service';
import { Task } from './tasks.service';
export interface Sprint {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  project: Project;
  tasks: Task[];
}
@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private apiUrl = 'http://localhost:8070/sprints'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  getSprintById(sprintId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${sprintId}`);
  }
  updateTaskStatus(taskId: number, status: string): Observable<void> {
    return this.http.put<void>(`http://localhost:8070/tasks/${taskId}/status`, { status });
  }
  getUsersForSprint(sprintId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${sprintId}/users`);
  }
  createSprint(projectId: number, sprintData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${projectId}`, sprintData);
  }
}