import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sprint, SprintInput, User } from '../models';

@Injectable({ providedIn: 'root' })
export class SprintService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/sprints`;

  getSprint(id: number): Observable<Sprint> {
    return this.http.get<Sprint>(`${this.url}/${id}`);
  }

  /** The project team: the people a task of this sprint can be assigned to. */
  getMembers(id: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}/${id}/users`);
  }

  createSprint(projectId: number, sprint: SprintInput): Observable<Sprint> {
    return this.http.post<Sprint>(`${this.url}/${projectId}`, sprint);
  }

  updateSprint(id: number, sprint: SprintInput): Observable<Sprint> {
    return this.http.put<Sprint>(`${this.url}/${id}`, sprint);
  }

  deleteSprint(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
