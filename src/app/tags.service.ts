import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Task } from './tasks.service';
export interface Tag{
id:number;

name : String; 
 task :Task;
}
@Injectable({
  providedIn: 'root'
})
export class TagsService {

  private apiUrl = 'http://localhost:8070/tags'; 

  constructor(private http: HttpClient) { }

  getTags(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  addTag(tagData: { name: string; taskId: number }): Observable<void> {
    const params = new HttpParams()
      .set('tag', tagData.name)
      .set('taskId', tagData.taskId.toString());

    return this.http.post<void>(this.apiUrl, null, { params });
  }
  updateTag(id: number, tag: any, taskId: number): Observable<any> {
    const url = `http://localhost:8070/tags/${id}?taskId=${taskId}`; // Ajoutez taskId en tant que paramètre de requête
    return this.http.put(url, tag);
  }
  
  
  deleteTag(tagId: number): Observable<void> {
    const url = `${this.apiUrl}/${tagId}`; 
    return this.http.delete<void>(url);
  }
  getTagById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  getTaskByTag(taskId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8070/tags/task/${taskId}`);
  }
  
  
}
