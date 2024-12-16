import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../users.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css'
})
export class EditUserComponent implements OnInit {
  user: any = {
    id: null,
    username: '',
    fullName: '',
    email: '',
    role: ''
  };

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupère l'ID de l'utilisateur à modifier depuis l'URL
    const userId = +this.route.snapshot.paramMap.get('id')!;
    
    // Appel du service pour obtenir les informations de l'utilisateur
    this.userService.getUserById(userId).subscribe(
      (user) => {
        this.user = user; // Remplir les champs avec les données de l'utilisateur
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );
  }

  onSubmit(): void {
    // Appel du service pour mettre à jour les informations de l'utilisateur
    this.userService.updateUser(this.user.id, this.user).subscribe(
      (response) => {
        console.log('User updated successfully');
        this.router.navigate(['/users']); // Redirige vers la liste des utilisateurs
      },
      (error) => {
        console.error('Error updating user:', error);
      }
    );
  }

  cancel(): void {
    // Redirection vers la liste des utilisateurs sans sauvegarder les modifications
    this.router.navigate(['/users']);
  }
}