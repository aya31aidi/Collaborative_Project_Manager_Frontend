import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { KanbanModule } from '@syncfusion/ej2-angular-kanban';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent,CommonModule, RouterOutlet,KanbanModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'collaborative-project-manager';
}
