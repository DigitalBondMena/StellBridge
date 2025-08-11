import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../core/env';
import { IProject, ProjectDetails } from './project';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private http = inject(HttpClient);

  getProjectsData(): Observable<IProject> {
    return this.http.get<IProject>(`${BASE_URL}projects `);
  }

  getProjectDetails(slug: string): Observable<ProjectDetails> {
    return this.http.get<ProjectDetails>(`${BASE_URL}project-detail/${slug}`);
  }
}
