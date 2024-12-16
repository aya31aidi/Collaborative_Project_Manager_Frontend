import { Component } from '@angular/core';
import { UserService } from '../users.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [FormsModule,RouterLink],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent {
  newUser = {
    username: '',
    fullName: '',
    email: '',
    role: ''
  };

  constructor(private userService: UserService, private router: Router) {}

  addUser(): void {
    // Appeler le service pour ajouter l'utilisateur
    this.userService.createUser(this.newUser).subscribe(
      (response) => {
        console.log('User added successfully', response);
        this.router.navigate(['/users']);  // Rediriger vers la liste des utilisateurs après ajout
      },
      (error) => {
        console.error('Error adding user:', error);
      }
    );
  }
  cancel(): void {
    // Redirige vers la page des utilisateurs sans ajouter l'utilisateur
    this.router.navigate(['/users']);
  }
}
