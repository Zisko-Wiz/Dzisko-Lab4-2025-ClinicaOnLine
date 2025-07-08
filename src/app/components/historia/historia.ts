import { Component, inject, input } from '@angular/core';
import { MostrarHistorial } from '../../directives/mostrar-historial';
import { Historia } from '../../models/historia.models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-historia',
  imports: [
    MostrarHistorial,
    DatePipe
  ],
  templateUrl: './historia.html',
  styleUrl: './historia.scss'
})
export class HistoriaComponent
{
  historias = input<Historia[]>();

}
