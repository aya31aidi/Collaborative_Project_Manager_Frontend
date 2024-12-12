import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../project.service';
import { HttpClientModule } from '@angular/common/http';
import { NgFor } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  standalone: true,
  selector: 'app-projects',
  imports: [HttpClientModule,NgFor,RouterOutlet,RouterLinkActive,RouterLink,CommonModule], 
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe((data) => {
      this.projects = data;
    });
    console.log('Projects component loaded');
  }
  ngOnDestroy(): void {
    console.log('Projects component destroyed');
  }
}
