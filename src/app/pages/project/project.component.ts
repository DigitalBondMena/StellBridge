import { Component, inject, signal } from '@angular/core';
import { ProjectsSharedComponent } from '../../shared/components/projects-shared/projects-shared.component';
import { LandingSectionComponent } from '../home/components/landing-section/landing-section.component';
import { Project } from './res/project';
import { ProjectsService } from './res/projects.service';

@Component({
  selector: 'app-project',
  imports: [LandingSectionComponent, ProjectsSharedComponent],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
})
export class ProjectComponent {
  private projectService = inject(ProjectsService);

  allProjects = signal<Project[]>([]);

  ngOnInit() {
    this.projectService.getProjectsData().subscribe((data) => {
      this.allProjects.set(data.projects);
    });
  }
}
