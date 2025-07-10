import { Component, inject, OnInit, output, ViewChild, ElementRef } from '@angular/core';
import { ChartBar2 } from '../chart-bar2/chart-bar2';
import { Header } from '../header/header';
import { MatButtonModule } from '@angular/material/button';
import { SupaService } from '../../services/supa.service';
import { Turno } from '../../models/turno';
import { DateTime, Duration, Interval } from 'luxon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormField, MatInputModule } from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { identity } from 'rxjs';
import domToImage from 'dom-to-image';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-stats',
  imports: [
    Header,
    ChartBar2,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
  templateUrl: './stats.html',
  styleUrl: './stats.scss'
})
export class Stats implements OnInit
{
  private supaService = inject(SupaService);
  protected titulo: string = "";
  protected loading: boolean = false;
  protected showChart: boolean = false;
  protected showDatePicker: boolean = false;
  protected turnos: Turno[] = [];
  protected fechaInicial : string = "";
  protected fechaFinal : string = "";
  protected modo: string = "";
  labels: string[] = [];
  data: number[] = []

  @ViewChild('dataToExport', { static: false }) public dataToExport!: ElementRef;

  ngOnInit(): void
  {
    this.getTurnos()
    .then
    (
      () => 
        {
          this.loading = false;
        }
    );
  }

  private async getTurnos()
  {
    return this.supaService.supabase
    .from('turnos').select
    (
      `
      *,
      users(firstname, surname)
      `
    )
    .order('fecha', { ascending: true })
    .then
    (
      ( {data, error} ) =>
      {
        if (error)
        {
          console.error(error.message, error.code);            
        } else {
          this.turnos = data;
        }
      }
    )
  }

  protected ocultarChart(modo: string)
  {
    this.modo = modo;
    this.showChart = false;
    this.showDatePicker = true;
  }

  protected setDatasetSegunModo()
  {
    switch (this.modo) {
      case 'solicitados':
        this.titulo = 'Turnos solicitados por Especialista'
        this.setDatasetTurnosPorEspecialista()
        break;
    
      case 'finalizados':
        this.titulo = 'Turnos finalizados por especialista';
        this.setDatasetTurnosFinalizadosPorEspecialista()
        break;
    }
  }

  protected setDatasetTurnosPorEspecialidad()
  {
    this.loading = true;
    this.showDatePicker = false;
    this.titulo = 'Turnos por especialidad';
    var tempDataset: {label: string, data: number}[] = [];
    var tempLabels: string[] = [];
    var tempData: number[] = []

    for (let index = 0; index < this.turnos.length; index++)
    {
      if (tempDataset.find( (x) => { return x.label == this.turnos[index].especialidad}) == undefined)
      {
        tempDataset.push({label: this.turnos[index].especialidad, data: 1})  
      } else {
        tempDataset[ tempDataset.findIndex( (x) => { return x.label == this.turnos[index].especialidad} ) ].data += 1;
      }
    }


    for (let index = 0; index < tempDataset.length; index++)
    {
      tempLabels.push(tempDataset[index].label);
      tempData.push(tempDataset[index].data)
    }
    this.labels = tempLabels;
    this.data = tempData;
    this.showChart = true;
    this.loading = false;
  }

  protected setDatasetTurnosPorDia()
  {
    this.loading = true;
    this.showDatePicker = false;
    this.titulo = 'Turnos por día';
    var tempDataset: {label: string, data: number, day: number}[] = [];
    var tempLabels: string[] = [];
    var tempData: number[] = []

    for (let index = 0; index < this.turnos.length; index++)
    {
      let f = DateTime.fromISO(this.turnos[index].fecha)
      let d = f.setZone('America/Argentina/Buenos_Aires').toFormat('cccc')

      if (tempDataset.find( (x) => { return x.label == d}) == undefined)
      {
        tempDataset.push({label: d, data: 1, day:f.weekday})
      } else {
        tempDataset[ tempDataset.findIndex( (x) => { return x.label == d} ) ].data += 1;
      }
    }

    tempDataset.sort( (a, b) => { return a.day - b.day} )

    for (let index = 0; index < tempDataset.length; index++)
    {
      switch (tempDataset[index].label) {
        case 'Monday':
          tempDataset[index].label = 'Lunes';
          break;

        case 'Tuesday':
        tempDataset[index].label = 'Martes';
        break;

        case 'Wednesday':
        tempDataset[index].label = 'Miércoles';
        break;

        case 'Thursday':
        tempDataset[index].label = 'Jueves';
        break;

        case 'Friday':
        tempDataset[index].label = 'Viernes';
        break;

        case 'Saturday':
        tempDataset[index].label = 'Sábado';
        break;

        case 'Sunday':
        tempDataset[index].label = 'Domingo';
        break;
      
      }

      tempLabels.push(tempDataset[index].label);
      tempData.push(tempDataset[index].data)
    }
    this.labels = tempLabels;
    this.data = tempData;
    this.showChart = true;
    this.loading = false;
  }

  protected setDatasetTurnosPorEspecialista()
  {
    this.loading = true;
    var intervalo = Interval.fromISO(`${this.fechaInicial}/${this.fechaFinal}`)
    var tempDataset: {label: string, data: number}[] = [];
    var tempLabels: string[] = [];
    var tempData: number[] = []

    for (let index = 0; index < this.turnos.length; index++)
    {
      if ( intervalo.contains(DateTime.fromISO(this.turnos[index].fecha)) && tempDataset.find( (x) => { return x.label == `${this.turnos[index].users.firstname} ${this.turnos[index].users.surname}`}) == undefined)
      {
        tempDataset.push({label: `${this.turnos[index].users.firstname} ${this.turnos[index].users.surname}`, data: 1})  
      } else if (intervalo.contains(DateTime.fromISO(this.turnos[index].fecha)) && tempDataset.find( (x) => { return x.label == `${this.turnos[index].users.firstname} ${this.turnos[index].users.surname}`}) != undefined) {
        tempDataset[ tempDataset.findIndex( (x) => { return x.label == `${this.turnos[index].users.firstname} ${this.turnos[index].users.surname}`} ) ].data += 1;
      }
    }

    for (let index = 0; index < tempDataset.length; index++)
    {
      tempLabels.push(tempDataset[index].label);
      tempData.push(tempDataset[index].data)
    }
    this.labels = tempLabels;
    this.data = tempData;
    this.showChart = true;
    this.loading = false;
  }

  protected setDatasetTurnosFinalizadosPorEspecialista()
  {
    this.loading = true;
    var intervalo = Interval.fromISO(`${this.fechaInicial}/${this.fechaFinal}`)
    var tempDataset: {label: string, data: number}[] = [];
    var tempLabels: string[] = [];
    var tempData: number[] = []

    for (let index = 0; index < this.turnos.length; index++)
    {
      if (intervalo.contains(DateTime.fromISO(this.turnos[index].fecha)) && tempDataset.find( (x) => { return x.label == `${this.turnos[index].users.firstname} ${this.turnos[index].users.surname}`}) == undefined && this.turnos[index].estado == 'finalizado')
      {
        tempDataset.push({label: `${this.turnos[index].users.firstname} ${this.turnos[index].users.surname}`, data: 1})  
      } else if (intervalo.contains(DateTime.fromISO(this.turnos[index].fecha)) && this.turnos[index].estado == 'finalizado' && tempDataset.find( (x) => { return x.label == `${this.turnos[index].users.firstname} ${this.turnos[index].users.surname}`}) != undefined) {
        tempDataset[ tempDataset.findIndex( (x) => { return x.label == `${this.turnos[index].users.firstname} ${this.turnos[index].users.surname}`} ) ].data += 1;
      }
    }

    for (let index = 0; index < tempDataset.length; index++)
    {
      tempLabels.push(tempDataset[index].label);
      tempData.push(tempDataset[index].data)
    }
    this.labels = tempLabels;
    this.data = tempData;
    this.showChart = true;
    this.loading = false;
  }

  public downloadAsPdf(): void 
  {
    var width = this.dataToExport.nativeElement.clientWidth;
    var height = this.dataToExport.nativeElement.clientHeight + 40;
    let orientation = 'l';
    let imageUnit = 'pt';

    if (width > height)
    {
      orientation = 'l';
    } else {
      orientation = 'p';
    }

    domToImage.toPng(this.dataToExport.nativeElement, {width: width,height: height})
    .then(result => 
      { 
        var pdf = new jsPDF({
                              orientation: "landscape",
                              unit: "pt",
                              format: [width + 30, height + 200],
                            });
        pdf.setFontSize(48);
        pdf.setTextColor('#2585fe');
        pdf.text(this.titulo, 25, 75);
        pdf.setFontSize(24);
        pdf.setTextColor('#131523');
        pdf.addImage(result, 'PNG', 25, 185, width, height);
        pdf.save(this.titulo + '.pdf');
      });
    }
}
