import { Routes } from '@angular/router';
import { ProjectsComponent } from './projects/projects.component';
import { TeamsComponent } from './teams/teams.component';
import { TeamDetailsComponent } from './team-details/team-details.component';
import { UsersComponent } from './users/users.component';
import { TasksComponent } from './tasks/tasks.component';
export const routes: Routes = [
    { path: 'projects', component: ProjectsComponent ,pathMatch: 'full'},
    { path: 'users', component: UsersComponent },
    { path: 'teams', component: TeamsComponent },
    { path: 'teams/:id', component: TeamDetailsComponent },
    { path: 'tasks', component: TasksComponent },
];
