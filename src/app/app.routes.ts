import { Routes } from '@angular/router';
import { ProjectsComponent } from './projects/projects.component';
import { TeamsComponent } from './teams/teams.component';
import { TeamDetailsComponent } from './team-details/team-details.component';
import { UsersComponent } from './users/users.component';
import { TasksComponent } from './tasks/tasks.component';
import { SprintDetailsComponent } from './sprint-details/sprint-details.component';
import { AddUserComponent } from './add-user/add-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { TagsComponent } from './tags/tags.component';
import { AddTagComponent } from './add-tag/add-tag.component';
import { EditTagComponent } from './edit-tag/edit-tag.component';
//import { HomeComponent } from './home/home.component';
export const routes: Routes = [
    { path: 'projects', component: ProjectsComponent ,pathMatch: 'full'},
    { path: 'users', component: UsersComponent },
    { path: 'teams', component: TeamsComponent },
    { path: 'teams/:id', component: TeamDetailsComponent },
    { path: 'tasks', component: TasksComponent },
    { path: 'sprints/:id', component: SprintDetailsComponent },
    { path: 'add-user', component: AddUserComponent },
    { path: 'edit-user/:id', component: EditUserComponent },
    { path: 'tags', component: TagsComponent }, 
    { path: 'add-tag', component: AddTagComponent },
    { path: 'edit-tag/:id', component: EditTagComponent }
   // { path: '/home', component: HomeComponent },
];
