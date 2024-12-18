import { Component ,OnInit} from '@angular/core';
import { TagsService } from '../tags.service';
import { NgFor } from '@angular/common';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [NgFor,NgIf,RouterLink],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.css'
})
export class TagsComponent implements OnInit {
  tags: any[] = []; 
  isLoading: boolean = true; 

  constructor(private tagsService: TagsService) {}

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.tagsService.getTags().subscribe(
      (tags) => {
        console.log(tags);  
        this.tags = tags;
        this.isLoading = false;
        this.tags.forEach(tag => {
          if (tag.task && tag.task.id) {
            this.tagsService.getTaskByTag(tag.task.id).subscribe(
              (task) => {
                console.log(task);  
                tag.task = task; 
              },
              (error) => {
                console.error('Erreur lors de la récupération de la tâche:', error);
              }
            );
          }
        });
      },
      (error) => {
        console.error('Erreur lors de la récupération des tags:', error);
        this.isLoading = false;
      }
    );
  }
  
  
  deleteTag(tagId: number): void {
    const confirmation = window.confirm('Are you sure you want to delete this tag?');
  
    if (confirmation) {
      this.tagsService.deleteTag(tagId).subscribe(
        (response) => {
          // Filtrer le tag supprimé de la liste des tags
          this.tags = this.tags.filter(tag => tag.id !== tagId);
          alert('Tag deleted successfully');
        },
        (error) => {
          console.error('Error deleting tag:', error);
          alert('Error deleting tag');
        }
      );
    }
  }
  
}
