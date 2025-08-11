import { Component, input } from '@angular/core';
import { AboutSharedComponent } from '../../../../shared/components/about-shared/about-shared.component';
import { AboutHome } from '../../res/home';

@Component({
  selector: 'app-about-sbc',
  imports: [AboutSharedComponent],
  templateUrl: './about-sbc.component.html',
  styleUrl: './about-sbc.component.css',
})
export class AboutSbcComponent {
  aboutHome = input<AboutHome>();
}
