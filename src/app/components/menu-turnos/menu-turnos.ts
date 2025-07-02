import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Header } from '../header/header';

@Component({
  selector: 'app-menu-turnos',
  imports: [
    Header,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './menu-turnos.html',
  styleUrl: './menu-turnos.scss'
})
export class MenuTurnos {

}
