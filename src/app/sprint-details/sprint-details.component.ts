import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { SprintService } from '../sprints.service';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-sprint-details',
  standalone: true,
  imports: [NgFor,CommonModule],
  templateUrl: './sprint-details.component.html',
  styleUrl: './sprint-details.component.css'
})
export class SprintDetailsComponent implements OnInit {
  sprintId!: number;
  sprint: any;

  constructor(private route: ActivatedRoute, private sprintService: SprintService) {}

  ngOnInit(): void {
    this.sprintId = +this.route.snapshot.paramMap.get('id')!;
    this.loadSprintDetails();
  }

  loadSprintDetails(): void {
    this.sprintService.getSprintById(this.sprintId).subscribe(data => {
      this.sprint = data;
    });
  }
}
