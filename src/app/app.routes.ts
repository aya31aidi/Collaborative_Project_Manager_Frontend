import { Routes } from '@angular/router';
import { ProjectsComponent } from './projects/projects.component';
export const routes: Routes = [
    { path: 'projects', component: ProjectsComponent ,pathMatch: 'full'},
    { path: '', redirectTo: '/projects', pathMatch: 'full' }, // Redirige vers /projects
    { path: '**', redirectTo: '/projects' }, 
];
