import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  Lightbox,
  LIGHTBOX_EVENT,
  LightboxConfig,
  LightboxEvent,
} from 'ngx-lightbox';
import { Subscription } from 'rxjs';
import { IMAGE_BASE_URL } from '../../core/env';
import {
  PaginationComponent,
  PaginationLink,
} from '../../shared/components/pagination/pagination.component';
import { LandingSectionComponent } from '../home/components/landing-section/landing-section.component';
import { Achievement, IAchievements } from './res/achievements';
import { AchievementsService } from './res/achievements.service';

interface Album {
  src: string;
  caption: string;
  thumb: string;
}

interface GalleryImage {
  id: number;
  imageUrl: string;
  caption?: string;
  isVideo?: boolean;
}

@Component({
  selector: 'app-achievements',
  imports: [
    LandingSectionComponent,
    CommonModule,
    HttpClientModule,
    PaginationComponent,
  ],
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.css',
})
export class AchievementsComponent implements OnInit, OnDestroy {
  private _subscription?: Subscription;
  private _lightbox = inject(Lightbox);
  private _lightboxEvent = inject(LightboxEvent);
  private _lightboxConfig = inject(LightboxConfig);
  private _achievementsService = inject(AchievementsService);
  private IMAGE_BASE_URL = IMAGE_BASE_URL;

  // Pagination signals
  links = signal<PaginationLink[]>([]);
  currentPage = signal<number>(1);
  lastPage = signal<number>(1);

  // Data arrays initialized as empty
  private achievementsData: Achievement[] = [];
  private galleryImagesData = signal<GalleryImage[]>([]);

  constructor() {
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
    // Fetch achievements data on component initialization
    this.getAchievementsData();
  }

  getAchievementsData(page: number = 1): void {
    this._achievementsService.getAchievements(page).subscribe({
      next: (data: IAchievements) => {
        // Store achievements data
        this.achievementsData = data.achievements.data;

        // Set pagination data
        this.links.set(data.achievements.links);
        this.currentPage.set(data.achievements.current_page);
        this.lastPage.set(data.achievements.last_page);

        // Map to galleryImagesData (all active achievements)
        const galleryImages = data.achievements.data
          .filter((achievement) => achievement.active_status === 1)
          .map((achievement: Achievement) => ({
            id: achievement.id,
            imageUrl: this.IMAGE_BASE_URL + achievement.main_image,
            caption: achievement.alt_image || '',
            isVideo: false,
          }));

        this.galleryImagesData.set(galleryImages);
      },
      error: (error) => {
        console.error('Error fetching achievements:', error);
      },
    });
  }

  onPageChange(page: number): void {
    this.getAchievementsData(page);
  }

  private convertToAlbum(images: GalleryImage[]): Album[] {
    return images.map((image) => ({
      src: image.imageUrl,
      caption: image.caption || '',
      thumb: image.imageUrl,
    }));
  }

  // Getter methods for template
  achievements() {
    return this.achievementsData;
  }

  galleryImages() {
    return this.galleryImagesData();
  }

  // Open lightbox for gallery
  openLightbox(index: number, collection: 'gallery' = 'gallery'): void {
    this._subscription = this._lightboxEvent.lightboxEvent$.subscribe(
      (event: any) => {
        this._onReceivedEvent(event);
      }
    );

    const images = this.galleryImagesData();
    const albums = this.convertToAlbum(images);
    this._lightbox.open(albums, index, {
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
      if (this._subscription) {
        this._subscription.unsubscribe();
      }
    }
    if (event.id === LIGHTBOX_EVENT.OPEN) {
      console.log('Lightbox opened');
    }
    if (event.id === LIGHTBOX_EVENT.CHANGE_PAGE) {
      console.log('Image changed to index:', event.data);
    }
  }

  // Close lightbox programmatically
  closeLightbox(): void {
    this._lightbox.close();
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}
