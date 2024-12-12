import { Component } from '@angular/core';
import { RouterLink,RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterLinkActive,RouterLink], 
})
export class NavbarComponent {}
