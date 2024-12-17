import { Component,OnInit } from '@angular/core';
import { TagsService } from '../tags.service';
import { Router } from '@angular/router';
import { NgFor,NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { TasksService } from '../tasks.service';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-add-tag',
  standalone: true,
  imports: [NgFor,NgIf,FormsModule,RouterLink],
  templateUrl: './add-tag.component.html',
  styleUrl: './add-tag.component.css'
})
export class AddTagComponent implements OnInit {
  tagName: string = ''; 
  selectedTaskId: number | null = null; 
  tasks: any[] = []; 
  isLoading: boolean = false; 

  constructor(
    private tagsService: TagsService,
    private taskService: TasksService, 
    private router: Router
  ) {}

  ngOnInit(): void {

    this.taskService.getAllTasks().subscribe(
      (tasks) => {
        this.tasks = tasks;
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        alert('Failed to load tasks');
      }
    );
  }

  addTag(): void {
    if (this.tagName.trim() && this.selectedTaskId) {
      this.isLoading = true;

      const tagData = {
        name: this.tagName,
        taskId: this.selectedTaskId
      };

      this.tagsService.addTag(tagData).subscribe(
        () => {
          this.isLoading = false;
          alert('Tag added successfully');
          this.router.navigate(['/tags']); // Redirection
        },
        (error) => {
          this.isLoading = false;
          console.error('Error while adding the tag:', error);
          alert('Error while adding the tag');
        }
      );
    } else {
      alert('Please enter a tag name and select a task.');
    }
  }
  
}