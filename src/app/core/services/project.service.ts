import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, ProjectInput } from '../models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/projects`;

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.url);
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.url}/${id}`);
  }

  /** A project is always created for a team (one project per team). */
  addProject(teamId: number, project: ProjectInput): Observable<Project> {
    return this.http.post<Project>(`${this.url}/${teamId}`, project);
  }

  updateProject(id: number, project: ProjectInput): Observable<Project> {
    return this.http.put<Project>(`${this.url}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
