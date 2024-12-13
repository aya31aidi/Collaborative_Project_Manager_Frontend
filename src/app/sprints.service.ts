import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}