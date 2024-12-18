import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './users.service';
export interface Team {
  id: number;
  name: string;
  users: User[];
}
@Injectable({
  providedIn: 'root'
})
export class TeamsService {

  private apiUrl = 'http://localhost:8070/teams'; 

  constructor(private http: HttpClient) {}

  // Fetch all teams
  getAllTeams(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Fetch a specific team by ID
  getTeamById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  getProjectByTeamId(teamId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8070/projects/team/${teamId}`);
  }
  getUsersByTeamId(teamId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${teamId}/users`);
  }
  deleteTeam(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

 /* deleteUser(teamId:number ,userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${teamId}/user/${userId}`);  // Adapter l'URL selon votre API
  }*/
    deleteUserFromTeam(teamId: number, userId: number): Observable<void> {
      const url = `${this.apiUrl}/${teamId}/users/${userId}`;
      return this.http.delete<void>(url);
    }
  
}
