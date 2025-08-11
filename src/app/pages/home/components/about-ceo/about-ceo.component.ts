import { Component, input } from '@angular/core';
import { AboutSharedComponent } from '../../../../shared/components/about-shared/about-shared.component';
import { AboutHome } from '../../res/home';

@Component({
  selector: 'app-about-ceo',
  imports: [AboutSharedComponent],
  templateUrl: './about-ceo.component.html',
  styleUrl: './about-ceo.component.css',
})
export class AboutCeoComponent {
  aboutHome = input<AboutHome>();
}
