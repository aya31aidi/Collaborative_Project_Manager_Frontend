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
  tags: any[] = []; // Stocke les tags récupérés depuis l'API
  isLoading: boolean = true; // Indicateur de chargement

  constructor(private tagsService: TagsService) {}

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.tagsService.getTags().subscribe(
      (response) => {
        this.tags = response; // Assigner la réponse (les tags) à la variable tags
        this.isLoading = false; // Mettre à jour l'état de chargement
      },
      (error) => {
        console.error('Erreur lors de la récupération des tags:', error);
        this.isLoading = false;
      }
    );
  }
  
  deleteTag(tagId: number): void {
    // Demande de confirmation avant de supprimer le tag
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
