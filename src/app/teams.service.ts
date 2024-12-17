import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  
}
