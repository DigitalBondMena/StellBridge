import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SafeHtmlPipe } from '../../../core/pipes/safe-html.pipe';

@Component({
  selector: 'app-about-shared',
  imports: [RouterLink, SafeHtmlPipe],
  templateUrl: './about-shared.component.html',
  styleUrl: './about-shared.component.css',
})
export class AboutSharedComponent {
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) description: string = '';
  // coloredTitle: string = '';
  // mainTitle: string = '';

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['title'] && this.title) {
  //     console.log(this.title);
  //     const lastSpaceIndex = this.title.lastIndexOf(' ');

  //     if (lastSpaceIndex !== -1) {
  //       this.mainTitle = this.title.substring(0, lastSpaceIndex);
  //       this.coloredTitle = this.title.substring(lastSpaceIndex + 1);
  //     } else {
  //       // No spaces: everything is colored
  //       this.mainTitle = '';
  //       this.coloredTitle = this.title;
  //     }
  //   }
  // }
}
