import { Component } from '@angular/core';
import { ActivatedRoute, ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import 'animate.css';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'clinicaOnline';

  constructor(protected route: ActivatedRoute, private contexts: ChildrenOutletContexts) {}

}