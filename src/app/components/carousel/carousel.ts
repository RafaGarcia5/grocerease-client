import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';

register();

@Component({
  standalone: true,
  selector: 'app-carousel',
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Carousel {
  carouselImages = [
    '/assets/dashboard/banner-1.png',
    '/assets/dashboard/banner-2.png',
    '/assets/dashboard/banner-3.webp',
    '/assets/dashboard/banner-4.webp',
  ];
}
