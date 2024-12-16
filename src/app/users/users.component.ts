import { Component } from '@angular/core';
import { UserService } from '../users.service';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router'; // Assurez-vous que l'importation vient de '@angular/router'

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule,HttpClientModule,RouterLink],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: any[] = [];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }
  editUser(user: any): void {
    // Redirige vers une page de modification de l'utilisateur (à créer si nécessaire)
    this.router.navigate(['/edit-user', user.id]); 
  }

  deleteUser(userId: number): void {
    // Confirmation avant suppression
    const isConfirmed = window.confirm('Are you sure you want to delete this user?');
    
    if (isConfirmed) {
      this.userService.deleteUser(userId).subscribe(
        (response) => {
          console.log('User deleted successfully');
          this.loadUsers(); // Recharge la liste des utilisateurs après suppression
        },
        (error) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }

}
