import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from '../../core/constants/app-routes';

@Component({
  selector: 'app-not-found',
  imports: [MatIconModule, RouterModule, MatButtonModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound {
  readonly routes = APP_ROUTES;
}
