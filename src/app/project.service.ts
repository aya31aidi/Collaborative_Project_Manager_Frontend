import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from './teams.service';
import { Sprint } from './sprints.service';
export interface Project {
  id: number;
  name: string;
  description: string;
  team: Team;
  sprints: Sprint[];
}
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = 'http://localhost:8070/projects'; 

  constructor(private http: HttpClient) {}

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  addProject(teamId: number, project: any): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/${teamId}`, project);
  }
  deleteProject(projectId: number) {
    return this.http.delete(`${this.apiUrl}/${projectId}`);
  }
}
