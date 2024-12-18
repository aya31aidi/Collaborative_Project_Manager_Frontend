import { Component ,OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TagsService } from '../tags.service';
import { TasksService } from '../tasks.service';
import { NgModel, FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-edit-tag',
  standalone: true,
  imports: [NgIf, NgFor,FormsModule,RouterLink],
  templateUrl: './edit-tag.component.html',
  styleUrl: './edit-tag.component.css'
})
export class EditTagComponent implements OnInit {
  tag: any = { name: '', taskId: null }; 
  tasks: any[] = []; 
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private tagsService: TagsService,
    private tasksService: TasksService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const tagId = this.route.snapshot.paramMap.get('id');
    if (tagId) {
      // Fetch the tag by ID
      this.tagsService.getTagById(+tagId).subscribe(
        (data) => {
          this.tag = data;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching tag data:', error);
          alert('Error loading tag');
          this.router.navigate(['/tags']);
        }
      );
    }

    // Fetch tasks for the dropdown
    this.tasksService.getAllTasks().subscribe(
      (tasks) => (this.tasks = tasks),
      (error) => console.error('Error fetching tasks:', error)
    );
  }

  updateTag(): void {
    if (this.tag.name.trim() && this.tag.taskId) {
      this.tagsService.updateTag(this.tag.id, this.tag, this.tag.taskId).subscribe(
        () => {
          alert('Tag updated successfully');
          this.router.navigate(['/tags']);
        },
        (error) => {
          console.error('Error updating tag:', error);
          alert('Error updating tag');
        }
      );
    } else {
      alert('Please fill in all required fields.');
    }
}

  
}