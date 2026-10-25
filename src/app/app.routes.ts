import { Routes } from '@angular/router';

// Every page is loaded on first visit, which keeps the initial bundle small.
export const routes: Routes = [
  {
    path: '',
    title: 'Overview · Project Manager',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'projects',
    title: 'Projects · Project Manager',
    loadComponent: () => import('./pages/projects/projects.component').then((m) => m.ProjectsComponent),
  },
  {
    path: 'projects/:id',
    title: 'Project · Project Manager',
    loadComponent: () => import('./pages/project-detail/project-detail.component').then((m) => m.ProjectDetailComponent),
  },
  {
    path: 'sprints/:id',
    title: 'Sprint board · Project Manager',
    loadComponent: () => import('./pages/sprint-board/sprint-board.component').then((m) => m.SprintBoardComponent),
  },
  {
    path: 'tasks',
    title: 'All tasks · Project Manager',
    loadComponent: () => import('./pages/tasks/tasks.component').then((m) => m.TasksComponent),
  },
  {
    path: 'teams',
    title: 'Teams · Project Manager',
    loadComponent: () => import('./pages/teams/teams.component').then((m) => m.TeamsComponent),
  },
  {
    path: 'teams/:id',
    title: 'Team · Project Manager',
    loadComponent: () => import('./pages/team-detail/team-detail.component').then((m) => m.TeamDetailComponent),
  },
  {
    path: 'people',
    title: 'People · Project Manager',
    loadComponent: () => import('./pages/people/people.component').then((m) => m.PeopleComponent),
  },
  // Old links from the first version of the app.
  { path: 'home', redirectTo: '' },
  { path: 'users', redirectTo: 'people' },
  { path: '**', redirectTo: '' },
];
