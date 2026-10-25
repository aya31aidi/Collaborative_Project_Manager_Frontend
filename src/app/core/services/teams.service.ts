import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Team } from '../models';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/teams`;

  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.url);
  }

  getTeam(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.url}/${id}`);
  }

  createTeam(name: string): Observable<Team> {
    return this.http.post<Team>(this.url, { name });
  }

  renameTeam(id: number, name: string): Observable<Team> {
    return this.http.put<Team>(`${this.url}/${id}`, { name });
  }

  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  addMember(teamId: number, userId: number): Observable<Team> {
    return this.http.post<Team>(`${this.url}/${teamId}/addUser/${userId}`, null);
  }

  removeMember(teamId: number, userId: number): Observable<Team> {
    return this.http.delete<Team>(`${this.url}/${teamId}/users/${userId}`);
  }
}
