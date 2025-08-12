import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../core/env';
import { IProjects, ProjectDetails } from './project';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private http = inject(HttpClient);

  getProjectsData(page: number = 1): Observable<IProjects> {
    return this.http.get<IProjects>(`${BASE_URL}projects?page=${page}`);
  }

  getProjectDetails(slug: string): Observable<ProjectDetails> {
    return this.http.get<ProjectDetails>(`${BASE_URL}project-detail/${slug}`);
  }
}
