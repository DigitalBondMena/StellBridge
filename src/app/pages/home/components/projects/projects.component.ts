import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ProjectsSharedComponent } from '../../../../shared/components/projects-shared/projects-shared.component';
import { Project } from '../../res/home';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ProjectsSharedComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent {
  projects = input<Project[]>([]);
}
