import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shared-career',
  imports: [CommonModule, RouterLink],
  templateUrl: './shared-career.component.html',
  styleUrl: './shared-career.component.css'
})
export class SharedCareerComponent {
  careers = input<any>([]);
}
