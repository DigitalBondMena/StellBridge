import { Component, inject, signal } from '@angular/core';
import {
  PaginationComponent,
  PaginationLink,
} from '../../shared/components/pagination/pagination.component';
import { ProjectsSharedComponent } from '../../shared/components/projects-shared/projects-shared.component';
import { LandingSectionComponent } from '../home/components/landing-section/landing-section.component';
import { projectData } from './res/project';
import { ProjectsService } from './res/projects.service';

@Component({
  selector: 'app-project',
  imports: [
    LandingSectionComponent,
    ProjectsSharedComponent,
    PaginationComponent,
  ],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
})
export class ProjectComponent {
  private projectService = inject(ProjectsService);

  links = signal<PaginationLink[]>([]);
  currentPage = signal<number>(1);
  lastPage = signal<number>(1);

  allProjects = signal<projectData[]>([]);

  ngOnInit() {
    this.getProjectData();
  }

  getProjectData(page: number = 1) {
    this.projectService.getProjectsData(page).subscribe((data) => {
      this.allProjects.set(data.projects.data);
      this.links.set(data.projects.links as PaginationLink[]);
      this.currentPage.set(data.projects.current_page);
      this.lastPage.set(data.projects.last_page);
    });
  }

  onPageChange(page: number): void {
    this.getProjectData(page);
  }
}
