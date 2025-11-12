import { Component } from '@angular/core';
import { CategoriesComponent } from '../../components/categories.component/categories.component';
import { Carousel } from "../../components/carousel/carousel";

@Component({
  selector: 'app-home',
  imports: [CategoriesComponent, Carousel],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
