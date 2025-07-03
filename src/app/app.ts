import { Component } from '@angular/core';
import { ActivatedRoute, ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animate';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations:
  [
    slideInAnimation,
  ]
})
export class App {
  protected title = 'clinicaOnline';

  constructor(protected route: ActivatedRoute, private contexts: ChildrenOutletContexts) {}

  getRouteAnimationData()
  {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
