// Shapes of the JSON sent by the Spring Boot API.

export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'TO_DO', label: 'To do' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
];

export const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string | null;
}

/** Body of POST/PUT /users. The password is optional on edit (empty keeps it). */
export interface UserInput {
  username: string;
  fullName: string;
  email: string;
  role: string;
  password?: string;
}

export interface Team {
  id: number;
  name: string;
  users: User[];
  project: { id: number; name: string; description: string | null } | null;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: User | null;
  tags: Tag[];
  sprintId: number;
  sprintName: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  sprintId: number;
  assigneeId: number | null;
  tags: string[];
}

export interface Sprint {
  id: number;
  name: string;
  startDate: string; // yyyy-MM-dd
  endDate: string;
  projectId: number;
  projectName: string;
  tasks: Task[];
}

export interface SprintInput {
  name: string;
  startDate: string;
  endDate: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  team: Omit<Team, 'project'> | null;
  sprints: Sprint[];
}

export interface ProjectInput {
  name: string;
  description: string;
}
