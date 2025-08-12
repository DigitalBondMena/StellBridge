import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeHtmlPipe } from '../../core/pipes/safe-html.pipe';
import { IMAGE_BASE_URL } from './../../core/env';

import {
  Lightbox,
  LIGHTBOX_EVENT,
  LightboxConfig,
  LightboxEvent,
} from 'ngx-lightbox';
import { Subscription } from 'rxjs';
import { ProjectDetails } from '../project/res/project';
import { ProjectsService } from '../project/res/projects.service';

interface Album {
  src: string;
  caption: string;
  thumb: string;
}

interface ProjectData {
  id: number;
  en_title: string;
  en_main_text: string;
  en_meta_title: string;
  en_meta_description: string;
  en_alt_image: string;
  main_image: string;
  en_script: string;
  en_slug: string;
  active_status: number;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe, NgOptimizedImage],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.css',
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  private _subscription?: Subscription;

  // Project data from API
  projectData: ProjectDetails = {} as ProjectDetails;

  // Loading state
  isLoading = true;

  // Album data for ngx-lightbox (dynamic from API)
  albums: Album[] = [];

  // Gallery images (excluding header)
  galleryAlbums: Album[] = [];
  IMAGE_BASE_URL: string = IMAGE_BASE_URL;

  private ProjectDetails = inject(ProjectsService);
  constructor(
    private _lightbox: Lightbox,
    private _lightboxEvent: LightboxEvent,
    private _lightboxConfig: LightboxConfig,
    private http: HttpClient
  ) {
    // Configure lightbox options
    this._lightboxConfig.fadeDuration = 0.7;
    this._lightboxConfig.resizeDuration = 0.5;
    this._lightboxConfig.fitImageInViewPort = true;
    this._lightboxConfig.positionFromTop = 20;
    this._lightboxConfig.showImageNumberLabel = true;
    this._lightboxConfig.alwaysShowNavOnTouchDevices = true;
    this._lightboxConfig.wrapAround = true;
    this._lightboxConfig.disableScrolling = true;
    this._lightboxConfig.centerVertically = true;
    this._lightboxConfig.enableTransition = true;
    this._lightboxConfig.showZoom = true;
    this._lightboxConfig.showRotate = false;
    this._lightboxConfig.showDownloadButton = false;
    this._lightboxConfig.albumLabel = 'Image %1 of %2';
  }

  ngOnInit(): void {
    this.id();
    this.fetchProjectData();
  }

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  projectId!: number;

  id() {
    this.activatedRoute.paramMap.subscribe((next: any) => {
      this.projectId = next.get('id');
    });
  }

  fetchProjectData(): void {
    if (this.projectId) {
      this.ProjectDetails.getProjectDetails(
        this.projectId.toString()
      ).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.projectData = response;

            // Check if projectimagesactive exists and has data
            if (
              response.project?.projectimagesactive &&
              response.project.projectimagesactive.length > 0
            ) {
              console.log(
                'Project images found:',
                response.project.projectimagesactive
              );
              this.albums = response.project.projectimagesactive.map(
                (item) => ({
                  src: IMAGE_BASE_URL + item.main_image,
                  caption: item.en_alt_name || '',
                  thumb: IMAGE_BASE_URL + item.main_image,
                })
              );
              console.log('Albums created:', this.albums);
            } else {
              console.log('No project images found in response');
              this.albums = [];
            }

            // Update gallery albums
            this.galleryAlbums = [...this.albums];
            console.log('Gallery albums updated:', this.galleryAlbums);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching project data:', error);
          this.isLoading = false;
        },
      });
    }
  }

  navigateToSection(fragment: string): void {
    this.router
      .navigate([], {
        fragment,
        replaceUrl: true,
      })
      .then(() => {
        // Add small delay to ensure router's scroll restoration completes first
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }, 0);
      });
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  // Open lightbox for gallery images
  openLightbox(index: number): void {
    // Start subscription for lightbox events
    this._subscription = this._lightboxEvent.lightboxEvent$.subscribe(
      (event: any) => {
        this._onReceivedEvent(event);
      }
    );

    // Open lightbox with gallery images
    this._lightbox.open(this.galleryAlbums, index, {
      wrapAround: true,
      showImageNumberLabel: true,
      centerVertically: true,
      enableTransition: true,
      showZoom: true,
    });
  }

  // Open lightbox for header image
  openHeaderLightbox(): void {
    // Start subscription for lightbox events
    this._subscription = this._lightboxEvent.lightboxEvent$.subscribe(
      (event: any) => {
        this._onReceivedEvent(event);
      }
    );

    // Open lightbox starting from header image (index 0)
    this._lightbox.open(this.albums, 0, {
      wrapAround: true,
      showImageNumberLabel: true,
      centerVertically: true,
      enableTransition: true,
      showZoom: true,
    });
  }

  // Handle lightbox events
  private _onReceivedEvent(event: any): void {
    if (event.id === LIGHTBOX_EVENT.CLOSE) {
      // Unsubscribe when lightbox is closed
      if (this._subscription) {
        this._subscription.unsubscribe();
      }
    }

    if (event.id === LIGHTBOX_EVENT.OPEN) {
      // Event fired when lightbox opens
      console.log('Lightbox opened');
    }

    if (event.id === LIGHTBOX_EVENT.CHANGE_PAGE) {
      // Event fired when changing images
      console.log('Image changed to index:', event.data);
    }
  }

  // Close lightbox programmatically (if needed)
  closeLightbox(): void {
    this._lightbox.close();
  }
}
