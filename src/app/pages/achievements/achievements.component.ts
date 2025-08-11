// import { CommonModule } from '@angular/common';
// import { Component, inject, OnDestroy } from '@angular/core';
// import {
//   Lightbox,
//   LIGHTBOX_EVENT,
//   LightboxConfig,
//   LightboxEvent,
// } from 'ngx-lightbox';
// import { Subscription } from 'rxjs';
// import { LandingSectionComponent } from '../home/components/landing-section/landing-section.component';

// interface Achievement {
//   id: number;
//   title: string;
//   imageUrl: string;
//   year: number;
// }

// interface Album {
//   src: string;
//   caption: string;
//   thumb: string;
// }

// interface GalleryImage {
//   id: number;
//   imageUrl: string;
//   caption?: string;
//   isVideo?: boolean;
// }

// @Component({
//   selector: 'app-achievements',
//   imports: [LandingSectionComponent, CommonModule],
//   templateUrl: './achievements.component.html',
//   styleUrl: './achievements.component.css',
// })
// export class AchievementsComponent implements OnDestroy {
//   private _subscription?: Subscription;

//   // Inject services using modern Angular approach
//   private _lightbox = inject(Lightbox);
//   private _lightboxEvent = inject(LightboxEvent);
//   private _lightboxConfig = inject(LightboxConfig);

//   constructor() {
//     // Configure lightbox options like in project-details
//     this._lightboxConfig.fadeDuration = 0.7;
//     this._lightboxConfig.resizeDuration = 0.5;
//     this._lightboxConfig.fitImageInViewPort = true;
//     this._lightboxConfig.positionFromTop = 20;
//     this._lightboxConfig.showImageNumberLabel = true;
//     this._lightboxConfig.alwaysShowNavOnTouchDevices = true;
//     this._lightboxConfig.wrapAround = true;
//     this._lightboxConfig.disableScrolling = true;
//     this._lightboxConfig.centerVertically = true;
//     this._lightboxConfig.enableTransition = true;
//     this._lightboxConfig.showZoom = true;
//     this._lightboxConfig.showRotate = false;
//     this._lightboxConfig.showDownloadButton = false;
//     this._lightboxConfig.albumLabel = 'Image %1 of %2';
//   }

//   // Featured images for the two-image grid section
//   private featuredImagesData: GalleryImage[] = [
//     {
//       id: 1,
//       imageUrl: 'https://dummyimage.com/1920x1080/000/fff',
//       caption: 'Single lightbox image',
//     },
//     {
//       id: 2,
//       imageUrl: 'https://dummyimage.com/1920x1080/000/fff',
//       caption: 'Single lightbox video',
//       isVideo: true,
//     },
//   ];

//   // Gallery images for the main gallery section
//   private galleryImagesData: GalleryImage[] = [
//     {
//       id: 1,
//       imageUrl: '/img/achivements/1.jpg',
//       caption: '',
//     },
//     {
//       id: 2,
//       imageUrl: '/img/achivements/2.jpg',
//       caption: '',
//     },
//     {
//       id: 3,
//       imageUrl: '/img/achivements/3.jpg',
//       caption: '',
//     },
//     {
//       id: 4,
//       imageUrl: '/img/achivements/4.jpg',
//       caption: '',
//     },
//     {
//       id: 5,
//       imageUrl: '/img/achivements/5.jpg',
//       caption: '',
//       isVideo: true,
//     },
//     {
//       id: 7,
//       imageUrl: '/img/achivements/7.jpg',
//       caption: '',
//     },
//     {
//       id: 8,
//       imageUrl: '/img/achivements/8.jpg',
//       caption: '',
//     },
//     {
//       id: 9,
//       imageUrl: '/img/achivements/9.jpg',
//       caption: '',
//     },
//   ];

//   // Sample achievements data - replace with real data
//   private achievementsData: Achievement[] = [
//     {
//       id: 1,
//       title: 'Modern Office Complex',
//       imageUrl: '/img/achivements/1.png',
//       year: 2024,
//     },
//     {
//       id: 2,
//       title: 'Steel Bridge Infrastructure',
//       imageUrl: '/img/achivements/2.png',
//       year: 2023,
//     },
//     {
//       id: 3,
//       title: 'Luxury Residential Tower',
//       imageUrl: '/img/achivements/3.png',
//       year: 2024,
//     },
//     {
//       id: 4,
//       title: 'Industrial Warehouse Complex',
//       imageUrl: '/img/achivements/4.png',
//       year: 2023,
//     },
//     {
//       id: 5,
//       title: 'Hospital Expansion Project',
//       imageUrl: '/img/achivements/5.png',
//       year: 2024,
//     },
//     {
//       id: 6,
//       title: 'Shopping Mall Complex',
//       imageUrl: '/img/achivements/6.png',
//       year: 2022,
//     },
//   ];

//   // Convert GalleryImage to Album format for lightbox
//   private convertToAlbum(images: GalleryImage[]): Album[] {
//     return images.map((image) => ({
//       src: image.imageUrl,
//       caption: image.caption || '',
//       thumb: image.imageUrl,
//     }));
//   }

//   // Getter methods for template
//   achievements() {
//     return this.achievementsData;
//   }

//   featuredImages() {
//     return this.featuredImagesData;
//   }

//   galleryImages() {
//     return this.galleryImagesData;
//   }

//   // Open lightbox for featured images
//   openLightbox(
//     index: number,
//     collection: 'featured' | 'gallery' = 'gallery'
//   ): void {
//     // Start subscription for lightbox events
//     this._subscription = this._lightboxEvent.lightboxEvent$.subscribe(
//       (event: any) => {
//         this._onReceivedEvent(event);
//       }
//     );

//     // Get the appropriate image collection
//     const images =
//       collection === 'featured'
//         ? this.featuredImagesData
//         : this.galleryImagesData;

//     // Convert to Album format
//     const albums = this.convertToAlbum(images);

//     // Open lightbox
//     this._lightbox.open(albums, index, {
//       wrapAround: true,
//       showImageNumberLabel: true,
//       centerVertically: true,
//       enableTransition: true,
//       showZoom: true,
//     });
//   }

//   // Handle lightbox events
//   private _onReceivedEvent(event: any): void {
//     if (event.id === LIGHTBOX_EVENT.CLOSE) {
//       // Unsubscribe when lightbox is closed
//       if (this._subscription) {
//         this._subscription.unsubscribe();
//       }
//     }

//     if (event.id === LIGHTBOX_EVENT.OPEN) {
//       // Event fired when lightbox opens
//       console.log('Lightbox opened');
//     }

//     if (event.id === LIGHTBOX_EVENT.CHANGE_PAGE) {
//       // Event fired when changing images
//       console.log('Image changed to index:', event.data);
//     }
//   }

//   // Close lightbox programmatically (if needed)
//   closeLightbox(): void {
//     this._lightbox.close();
//   }

//   ngOnDestroy(): void {
//     if (this._subscription) {
//       this._subscription.unsubscribe();
//     }
//   }
// }

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import {
  Lightbox,
  LIGHTBOX_EVENT,
  LightboxConfig,
  LightboxEvent,
} from 'ngx-lightbox';
import { Subscription } from 'rxjs';
import { LandingSectionComponent } from '../home/components/landing-section/landing-section.component';
import { IAchievements } from './res/achievements';
import { AchievementsService } from './res/achievements.service';
import { IMAGE_BASE_URL } from '../../core/env';

interface Achievement {
  id: number;
  title: string;
  imageUrl: string;
  year: number;
}

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
  imports: [LandingSectionComponent, CommonModule, HttpClientModule],
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
  // Data arrays initialized as empty
  private achievementsData: Achievement[] = [];
  private featuredImagesData: GalleryImage[] = [];
  private galleryImagesData: GalleryImage[] = [];

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
    this._achievementsService.getAchievements().subscribe({
      next: (data: IAchievements) => {
        // Map service data to component's Achievement format
        this.achievementsData = data.achievements
          // .filter(achievement => achievement.active_status === 1) // Only active achievements
          .map((achievement: any, index: number) => ({
            id: index + 1,
            title: `Achievement ${index + 1}`, 
            imageUrl: this.IMAGE_BASE_URL + achievement.main_image,
            year: new Date().getFullYear(), 
          }));

        // Map to featuredImagesData (first two active achievements)
        this.featuredImagesData = data.achievements
          .filter(achievement => achievement.active_status === 1)
          .slice(0, 2)
          .map((achievement: any, index: number) => ({
            id: index + 1,
            imageUrl: this.IMAGE_BASE_URL + achievement.main_image,
            caption: achievement.alt_image || `Featured image ${index + 1}`,
            isVideo: false, // Adjust based on actual data if videos are supported
          }));

        // Map to galleryImagesData (all active achievements)
        this.galleryImagesData = data.achievements
          .filter(achievement => achievement.active_status === 1)
          .map((achievement: any, index: number) => ({
            id: index + 1,
            imageUrl: this.IMAGE_BASE_URL + achievement.main_image,
            caption: achievement.alt_image || '',
            isVideo: false, 
          }));
      },
      error: (error) => {
        console.error('Error fetching achievements:', error);
      }
    });
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

  featuredImages() {
    return this.featuredImagesData;
  }

  galleryImages() {
    return this.galleryImagesData;
  }

  // Open lightbox for featured images or gallery
  openLightbox(index: number, collection: 'featured' | 'gallery' = 'gallery'): void {
    this._subscription = this._lightboxEvent.lightboxEvent$.subscribe(
      (event: any) => {
        this._onReceivedEvent(event);
      }
    );

    const images = collection === 'featured' ? this.featuredImagesData : this.galleryImagesData;
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