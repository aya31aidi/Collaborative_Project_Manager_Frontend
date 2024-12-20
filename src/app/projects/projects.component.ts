import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../project.service';
import { HttpClientModule } from '@angular/common/http';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-projects',
  imports: [HttpClientModule,NgFor,RouterLink,CommonModule], 
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];

  constructor(private projectService: ProjectService, private router: Router ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe((data) => {
      this.projects = data;
    });
    console.log('Projects component loaded');
    console.log(this.projects);
  }
  ngOnDestroy(): void {
    console.log('Projects component destroyed');
  }
  editProject(projectId: number): void {
    this.router.navigate(['/edit-project', projectId]);
  }

  // Method to delete a project
  deleteProject(projectId: number): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(projectId).subscribe(() => {
        this.projects = this.projects.filter(project => project.id !== projectId);
      });
    }
  }
}
