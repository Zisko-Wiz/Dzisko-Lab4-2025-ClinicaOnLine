import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Header } from '../header/header';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { SigninService } from '../../services/signin.service';
import { SupaService } from '../../services/supa.service';
import { Horario } from '../../models/horario';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HistoriaComponent } from '../historia/historia';
import { Historia } from '../../models/historia.models';
import { jsPDF } from "jspdf";
import { DateTime, Duration, Interval } from 'luxon'

@Component({
  selector: 'app-perfil',
  imports: [
    Header,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    HistoriaComponent,
    MatSelectModule
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil implements OnInit, OnDestroy
{
  protected optionSelected: string = "";
  protected showDownloadOptions: boolean = false;
  protected loading: boolean = false;
  protected historiaCLinica: Historia[] = [];
  protected showHistorias: boolean = false;
  private snackBar = inject(MatSnackBar);
  private horariosSubscription?: Subscription;
  protected horariosCargados?: Horario[];
  protected signInService = inject(SigninService);
  protected supabaseService = inject(SupaService);
  protected especialidades: string[] = [];
  protected horarios = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
  ]
  protected horarioSabado = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
  ]
  perfilForm = new FormGroup(
  {
    lunes1: new FormControl(),
    martes1: new FormControl(),
    miercoles1: new FormControl(),
    jueves1: new FormControl(),
    viernes1: new FormControl(),
    sabado1: new FormControl(),
    lunes2: new FormControl(),
    martes2: new FormControl(),
    miercoles2: new FormControl(),
    jueves2: new FormControl(),
    viernes2: new FormControl(),
    sabado2: new FormControl()
  })

  ngOnInit(): void
  {
    this.horariosSubscription = this.signInService.horarioEmitter.subscribe(
    {
      next: (data: Horario[]) =>
      {
        if (data != undefined)
        {
          for (let index = 0; index < data.length; index++)
          {
            switch (data[index].dia)
            {
              case "lunes":
                this.perfilForm.controls.lunes1.setValue(data[index].hora_inicial);
                this.perfilForm.controls.lunes2.setValue(data[index].hora_final);
                break;

              case "martes":
              this.perfilForm.controls.martes1.setValue(data[index].hora_inicial);
              this.perfilForm.controls.martes2.setValue(data[index].hora_final);
              break;

              case "miércoles":
                this.perfilForm.controls.miercoles1.setValue(data[index].hora_inicial);
                this.perfilForm.controls.miercoles2.setValue(data[index].hora_final);
                break;

              case "jueves":
                this.perfilForm.controls.jueves1.setValue(data[index].hora_inicial);
                this.perfilForm.controls.jueves2.setValue(data[index].hora_final);
                break;

              case "viernes":
                this.perfilForm.controls.viernes1.setValue(data[index].hora_inicial);
                this.perfilForm.controls.viernes2.setValue(data[index].hora_final);
                break;

              case "sábado":
                this.perfilForm.controls.sabado1.setValue(data[index].hora_inicial);
                this.perfilForm.controls.sabado2.setValue(data[index].hora_final);
                break;
            }
          }

          this.perfilForm.updateValueAndValidity();

        }
      }
    });
  }

  ngOnDestroy(): void
  {
    this.horariosSubscription?.unsubscribe();
  }

  protected mostrarHistoriaClinica()
  {
    this.loading = true;
    this.getHistoriaClinica()
    .then(
      () => 
      {
        this.showHistorias = true;
        this.loading = false;
      }
    )
  }

  protected mostrarOpcionesDescarga()
  {
    if (this.historiaCLinica.length == 0)
    {
      this.getHistoriaClinica()
      .then
      (
        () => 
        {
          this.showDownloadOptions = true;
        }
      ) 
    } else {
      this.showDownloadOptions = true;
    }
  }

  protected async getHistoriaClinica()
  {
    if (this.historiaCLinica.length == 0)
    {
      this.loading = true;
      return this.cargarHistoriaCLinica()
      .then
      ( () =>
          {
            this.agregarDatosDinamicos()
            .then
            (
              () => 
                {
                  this.loading = false;
                }
            );
          }
      )
    }
  }

  private async cargarHistoriaCLinica()
  {
    this.loading = true;
    return this.supabaseService.supabase
    .from('historia')
    .select()
    .eq('email_paciente', this.signInService.usuario?.email)
    .then
    (
      ( {data, error} ) => 
      {
        if (error)
        {
          console.error(error.message, error.code);            
        } else {

          for (let index = 0; index < data.length; index++)
          {
            if (this.especialidades.find( (x) => { return x == data[index].especialidad} ) == undefined)
            {
             this.especialidades.push(data[index].especialidad)
            }
          }

          this.historiaCLinica = data;
        }
      }
    )
  }

  protected crearPDF()
  {
    if (this.historiaCLinica.length != 0)
    {
      this.loading = true;
      this.getHistoriaClinica()
      .then
      (
        () => 
        {
          var doc = new jsPDF();
          var y = 150;
          var fechaHoy = DateTime.now().setZone("America/Argentina/Buenos_Aires").toFormat('dd/MM/yyyy HH:mm');
          var count = 0;

          doc.text('HISTORIA CLÍNICA', 80, 10)
          doc.text(`Fecha de emisión: ${fechaHoy}`, 17, 15)
          doc.addImage("hospital.png",'PNG',60, 20, 100, 100)

          for (let index = 0; index < this.historiaCLinica.length; index++)
          {
            let fecha = DateTime.fromISO(this.historiaCLinica[index].fecha)
            .toFormat('dd/MM/yyyy HH:mm');
            
            if (this.historiaCLinica[index].especialidad == this.optionSelected || this.optionSelected == "todas")
            {
              if (count > 0)
              {
                doc.addPage();
                y = 150;
                doc.text('HISTORIA CLÍNICA', 80, 10)
                doc.text(`Fecha de emisión: ${fechaHoy}`, 17, 15)
                doc.addImage("hospital.png",'PNG',60, 20, 100, 100)
              }

              doc.text
              (
                [
                  fecha,
                  `Especialidad: ${this.historiaCLinica[index].especialidad}`,
                  `Altura: ${this.historiaCLinica[index].altura}`,
                  `Peso: ${this.historiaCLinica[index].peso}`,
                  `Temperatura: ${this.historiaCLinica[index].temperatura}`,
                  `Presión: ${this.historiaCLinica[index].presion}`
                ],10, (y)
              )

              if (this.historiaCLinica[index].datosDinamicos != undefined )
              {
                y += 32;
                for (let index2 = 0; index2 < this.historiaCLinica[index].datosDinamicos.length; index2++)
                {
                  y += 7;
                  let text =`${this.historiaCLinica[index].datosDinamicos[index2].clave}: ${this.historiaCLinica[index].datosDinamicos[index2].valor}`;
                  doc.text(text, 10, y)
                } 
              }

              count += 1;
              y += 50;
            }
          }

          doc.save(`${this.signInService.usuario?.firstname}-${this.signInService.usuario?.surname}`);
          this.loading = false;
        }
      )
    } else {
      alert('No existe historia clínica')
    }


  }

  private async agregarDatosDinamicos()
  {
    if (this.historiaCLinica.length > 0)
    {
      return this.supabaseService.supabase
      .from('datos_dinamicos')
      .select()
      .eq('email_paciente', this.signInService.usuario?.email)
      .then
      (
        ( {data, error} ) => 
        {
          if (error)
          {
            console.error(error.message, error.code);            
          } else {
            for (let index = 0; index < data.length; index++)
            {
              let indexHistoria = this.historiaCLinica.findIndex( (x) => { return x.fecha == data[index].fecha} );
              
              if( indexHistoria >= 0)
              {
                if (this.historiaCLinica[indexHistoria].datosDinamicos == undefined)
                {
                  this.historiaCLinica[indexHistoria].datosDinamicos = [];  
                }

                this.historiaCLinica[indexHistoria].datosDinamicos.push(data[index])
              }
            
            }
          }
        }
      )
    }
  }

  protected cargarNuevosHorarios()
  {
    if (this.perfilForm.get('lunes1')?.value != null && this.perfilForm.get('lunes2')?.value != null)
    {
      this.supabaseService.insertHorarios(this.signInService.usuario?.email, "lunes", this.perfilForm.get('lunes1')?.value,this.perfilForm.get('lunes2')?.value)
      .then(()=>{this.openSnackBar()});
    }

    if (this.perfilForm.get('martes1')?.value != null && this.perfilForm.get('martes2')?.value != null)
    {
      this.supabaseService.insertHorarios(this.signInService.usuario?.email, "martes", this.perfilForm.get('martes1')?.value,this.perfilForm.get('martes2')?.value)
      .then(()=>{this.openSnackBar()});
    }

    if (this.perfilForm.get('miercoles1')?.value != null && this.perfilForm.get('miercoles2')?.value != null)
    {
      this.supabaseService.insertHorarios(this.signInService.usuario?.email, "miércoles", this.perfilForm.get('miercoles1')?.value,this.perfilForm.get('miercoles2')?.value)
      .then(()=>{this.openSnackBar()});
    }

    if (this.perfilForm.get('jueves1')?.value != null && this.perfilForm.get('jueves2')?.value != null)
    {
      this.supabaseService.insertHorarios(this.signInService.usuario?.email, "jueves", this.perfilForm.get('jueves1')?.value,this.perfilForm.get('jueves2')?.value)
      .then(()=>{this.openSnackBar()});
    }

    if (this.perfilForm.get('viernes1')?.value != null && this.perfilForm.get('viernes2')?.value != null)
    {
      this.supabaseService.insertHorarios(this.signInService.usuario?.email, "viernes", this.perfilForm.get('viernes1')?.value,this.perfilForm.get('viernes2')?.value)
      .then(()=>{this.openSnackBar()});
    }

    if (this.perfilForm.get('sabado1')?.value != null && this.perfilForm.get('sabado2')?.value != null)
    {
      this.supabaseService.insertHorarios(this.signInService.usuario?.email, "sábado", this.perfilForm.get('sabado1')?.value,this.perfilForm.get('sabado2')?.value)
      .then(()=>{this.openSnackBar()});
    }
  }

  protected clearSelection(select:number)
  {
    switch (select)
    {
      case 1:
        this.perfilForm.controls.lunes1.setValue(null);
        this.perfilForm.controls.lunes2.setValue(null);
        this.perfilForm.updateValueAndValidity();
        break;
      
      case 2:
        this.perfilForm.controls.martes1.setValue(null);
        this.perfilForm.controls.martes2.setValue(null);
        this.perfilForm.updateValueAndValidity();
        break;

      case 3:
        this.perfilForm.controls.miercoles1.setValue(null);
        this.perfilForm.controls.miercoles2.setValue(null);
        this.perfilForm.updateValueAndValidity();
        break;

      case 4:
        this.perfilForm.controls.jueves1.setValue(null);
        this.perfilForm.controls.jueves2.setValue(null);
        this.perfilForm.updateValueAndValidity();
        break;

      case 5:
        this.perfilForm.controls.viernes1.setValue(null);
        this.perfilForm.controls.viernes2.setValue(null);
        this.perfilForm.updateValueAndValidity();
        break;

      case 6:
        this.perfilForm.controls.sabado1.setValue(null);
        this.perfilForm.controls.sabado2.setValue(null);
        this.perfilForm.updateValueAndValidity();
        break;

    }
  }

  openSnackBar() 
  {
    this.snackBar.open("Horarios Cargados", "Aceptar");
  }

}
