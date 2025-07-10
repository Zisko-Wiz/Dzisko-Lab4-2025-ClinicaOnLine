import { AfterViewInit, Component, inject, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Header } from '../header/header';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { NombrePipe } from '../../pipes/nombre-pipe';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupaService } from '../../services/supa.service';
import { Usuario } from '../../models/usuario.models';
import { Turno } from '../../models/turno';
import { SigninService } from '../../services/signin.service';
import { Remarcar } from '../../directives/remarcar';
import { MatCardModule } from '@angular/material/card';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { SiNoPipe } from '../../pipes/si-no-pipe';
import { MostrarHistorial } from '../../directives/mostrar-historial';
import { MiCaptcha } from '../mi-captcha/mi-captcha';

@Component({
  selector: 'app-mis-turnos',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    Header,
    MatButtonModule,
    MatProgressSpinnerModule,
    DatePipe,
    NombrePipe,
    MatInputModule,
    FormsModule,
    Remarcar,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    MatSliderModule,
    MatSlideToggleModule,
    SiNoPipe,
    MostrarHistorial,
    MiCaptcha
  ],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.scss'
})
export class MisTurnos implements AfterViewInit, OnInit
{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Turno>;

  expandedRow: any | null;

  protected captchaValido: boolean = false;
  private supabaseService = inject(SupaService);
  private signInService = inject(SigninService);
  protected showSpinner: boolean = false;
  protected showFormHistoria: boolean = false;
  protected todosUsuarios : Usuario[] = [];
  dataSource? :any;
  protected emailPacienteSeleccionado: string = "";
  protected especialidadSeleccionada: string= "";
  protected fechaTurnoSeleccionado: string = "";
  protected historiasClinicas: any[] = [];
  protected datosDinamicos: any[] = [];
  formHistoria = new FormGroup(
    {
      altura: new FormControl(null, [Validators.required]),
      peso: new FormControl(null, [Validators.required]),
      temperatura: new FormControl(null, [Validators.required]),
      presion: new FormControl(null, [Validators.required]),
      clave1: new FormControl(null),
      valor1: new FormControl(null),
      clave2: new FormControl(null),
      valor2: new FormControl(null),
      clave3: new FormControl(null),
      valor3: new FormControl(null),
      clave4: new FormControl(null),
      valor4a: new FormControl(0),
      valor4b: new FormControl(100),
      clave5: new FormControl(null),
      valor5: new FormControl(null, [Validators.pattern(/^\d+$/)]),
      clave6: new FormControl(null),
      valor6: new FormControl(true)
    } 
  )

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
                      'fecha',
                      'especialidad',
                      'email_paciente',
                      'aceptar',
                      'rechazar',
                      'finalizar',
                      'comment',
                      'estado',
                      'crearHistoria',
                      'verHistoria',
                    ];

  ngOnInit(): void
  {
    this.restart();
    this.getUsuarios();
  }

  async getDatosDinamicos()
  {
    return this.supabaseService.supabase.from('datos_dinamicos')
    .select()
    .then(
      ( {data, error} ) => 
        {
          if (error)
          {
            console.error(error.message, error.code);              
          } else {
            this.datosDinamicos = data;
          }
        }
    )
  }

  restart()
  {
    this.showSpinner = true;
    this.signInService.getUser()
    .then( () => 
    { 
      this.signInService.getUsuario()
      .then( () =>
      {
        this.getHistoriasClinicas()
        .then( () =>
        {
          this.getDatosDinamicos()
          .then( () =>
          {
            this.getTurnos(this.signInService.usuario!.email)
          })
        })
      })
    });
  }

  async getTurnos(email:string)
  {
    this.supabaseService.supabase
    .from('turnos')
    .select(
      `
      *,
      users(firstname, surname)
      `
    )
    .eq('email_esp', email)
    .then(
      ({data, error}) =>
      {
        if (error)
        {
          console.error(error.message, error.code);
                   
        } else
        {
          var dataSource = [];
          for (let index = 0; index < data.length; index++)
          {
            let h = this.historiasClinicas.find( (x) => 
              { return x.fecha == data[index].fecha} );
            var htxt = null;

            if (h != undefined)
            {
              htxt = `Altura: ${h.altura}\nPeso: ${h.peso}\nTemperatura: ${h.temperatura}\nPresión: ${h.presion}`

              if (this.datosDinamicos.find( (x) => 
                {return x.fecha == data[index].fecha}) != undefined)
              {
                for (let index2 = 0; index2 < this.datosDinamicos.length; index2++)
                {
                  if (this.datosDinamicos[index2].fecha == data[index].fecha)
                  {
                    htxt += `\n${this.datosDinamicos[index2].clave}: ${this.datosDinamicos[index2].valor}`
                  }
                }  
              }
            }
            
            let t = new Turno(data[index].fecha, data[index].email_esp, data[index].email_paciente, data[index].especialidad, data[index].estado, data[index].comentario, data[index].users.firstname, data[index].users.surname, data[index].calificacion, htxt);
            dataSource.push(t)
          }
          this.dataSource = new MatTableDataSource(dataSource);
          this.refresh();
          this.showSpinner = false;
        }
      }
    )
  }

  getUsuarios()
  {
    this.supabaseService.supabase
    .from('users')
    .select().then(
      ({data, error}) =>
      {
        if (error)
        {
          console.error(error.message, error.code);
                   
        } else
        {
          this.todosUsuarios = data;
          this.refresh();
        }
      }
    )
  }

  async getHistoriasClinicas()
  {
    return this.supabaseService.supabase.from('historia')
    .select()
    .eq('email_especialista', this.signInService.usuario?.email)
    .then(
      ( {data, error} ) => 
        {
          if (error)
          {
            console.error(error.message, error.code);              
          } else {
            this.historiasClinicas = data;
          }
        }
    )
  }
  
  onActionButtonClick(event: Event, eventData: Turno, newEstado:string)
  {
    this.showSpinner = true;
    let a = this.dataSource.data.find(( trn: Turno ) => { return trn.fecha == eventData.fecha} );
    a!.estado = newEstado;

    if (eventData.estado == "aceptado")
    {
      this.aceptarTurno(a!.fecha)      
    } else {
      this.updateTurno(a!.fecha, a!.estado, a.comentario)
    }

    this.table.renderRows();
    
  }

  private updateTurno(fecha:string, newEstado: boolean, comentario:string)
  {
    this.supabaseService.supabase
    .from('turnos')
    .update({ estado: newEstado, comentario: comentario })
    .eq('fecha', fecha).then(
      () => { this.showSpinner = false;}
    )
  }

  private aceptarTurno(fecha: string)
  {
    this.supabaseService.supabase
    .from('turnos')
    .update({estado: 'aceptado'})
    .eq('fecha', fecha)
    .then(
      () => { this.showSpinner = false;}
    )
  }

  ngAfterViewInit(): void
  {
    this.refresh()
  }

  refresh()
  {
    if(this.dataSource != undefined)
    {      
      this.dataSource.sort = this.sort;
      this.dataSource!.paginator = this.paginator;
      this.table.dataSource = this.dataSource;
    }
  }

  applyFilter(event: Event)
  {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return `${value}`;
  }

  crearHistoriaClinica(especialidad:string, emailPaciente: string, fecha: string)
  {
    this.emailPacienteSeleccionado = emailPaciente;
    this.fechaTurnoSeleccionado = fecha;
    this.especialidadSeleccionada = especialidad;
    this.changeFormVisibility();
    this.scrollToTop();
  }

  protected changeFormVisibility()
  {
    this.showFormHistoria = !this.showFormHistoria;
  }

  private scrollToTop()
  {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  subirHistoriClinica()
  {
    this.showSpinner = true;

    if (this.formHistoria.get('clave1')?.value != null && this.formHistoria.get('clave1')!.value != "" 
        && this.formHistoria.get('valor1')!.value != null && this.formHistoria.get('valor1')!.value != "")
    {
      this.supabaseService.supabase.from('datos_dinamicos')
      .insert(
        {
          email_paciente: this.emailPacienteSeleccionado,
          fecha: this.fechaTurnoSeleccionado,
          clave: this.formHistoria.get('clave1')!.value,
          valor: this.formHistoria.get('valor1')!.value
        }
      )
      .then
      (
        ({data, error}) => 
          {
            if (error)
            {
              console.error(error.message, error.code);              
            }
          }
      )
    }

    if (this.formHistoria.get('clave2')?.value != null && this.formHistoria.get('clave2')!.value != "" 
        && this.formHistoria.get('valor2')!.value != null && this.formHistoria.get('valor2')!.value != "")
    {
      this.supabaseService.supabase.from('datos_dinamicos')
      .insert(
        {
          email_paciente: this.emailPacienteSeleccionado,
          fecha: this.fechaTurnoSeleccionado,
          clave: this.formHistoria.get('clave2')!.value,
          valor: this.formHistoria.get('valor2')!.value
        }
      )
      .then
      (
        ({data, error}) => 
          {
            if (error)
            {
              console.error(error.message, error.code);              
            }
          }
      )
    }

    if (this.formHistoria.get('clave3')?.value != null && this.formHistoria.get('clave3')!.value != "" 
        && this.formHistoria.get('valor3')!.value != null && this.formHistoria.get('valor3')!.value != "")
    {
      this.supabaseService.supabase.from('datos_dinamicos')
      .insert(
        {
          email_paciente: this.emailPacienteSeleccionado,
          fecha: this.fechaTurnoSeleccionado,
          clave: this.formHistoria.get('clave3')!.value,
          valor: this.formHistoria.get('valor3')!.value
        }
      )
      .then
      (
        ({data, error}) => 
          {
            if (error)
            {
              console.error(error.message, error.code);              
            }
          }
      )
    }

    if (this.formHistoria.get('clave4')?.value != null && this.formHistoria.get('clave4')!.value != '')
    {

      let valor4: string = `${this.formHistoria.get('valor4a')?.value}-${this.formHistoria.get('valor4b')?.value}`;

      this.supabaseService.supabase.from('datos_dinamicos')
      .insert(
        {
          email_paciente: this.emailPacienteSeleccionado,
          fecha: this.fechaTurnoSeleccionado,
          clave: this.formHistoria.get('clave4')!.value,
          valor: valor4
        }
      )
      .then
      (
        ({data, error}) => 
          {
            if (error)
            {
              console.error(error.message, error.code);              
            }
          }
      )
    }

    if (this.formHistoria.get('clave5')?.value != null && this.formHistoria.get('clave5')!.value != "" 
        && this.formHistoria.get('valor5')!.value != null && this.formHistoria.get('valor5')!.value != "")
    {

      let valor5 = `${this.formHistoria.get('valor5')!.value}`

      this.supabaseService.supabase.from('datos_dinamicos')
      .insert(
        {
          email_paciente: this.emailPacienteSeleccionado,
          fecha: this.fechaTurnoSeleccionado,
          clave: this.formHistoria.get('clave5')!.value,
          valor: valor5
        }
      )
      .then
      (
        ({data, error}) => 
          {
            if (error)
            {
              console.error(error.message, error.code);              
            }
          }
      )
    }

    if (this.formHistoria.get('clave6')?.value != null && this.formHistoria.get('clave6')!.value != "" && this.formHistoria.get('valor6')!.value != null)
    {
      let valor6 :string = '';

      if (this.formHistoria.get('valor6')!.value)
      {
        valor6 = 'Sí';
      } else {
        valor6 = 'No';
      }

      this.supabaseService.supabase.from('datos_dinamicos')
      .insert(
        {
          email_paciente: this.emailPacienteSeleccionado,
          fecha: this.fechaTurnoSeleccionado,
          clave: this.formHistoria.get('clave6')!.value,
          valor: valor6
        }
      )
      .then
      (
        ({data, error}) => 
          {
            if (error)
            {
              console.error(error.message, error.code);              
            }
          }
      )
    }

    this.supabaseService.supabase.from('historia')
    .insert(
      {
        email_paciente: this.emailPacienteSeleccionado,
        email_especialista: this.signInService.usuario?.email,
        fecha: this.fechaTurnoSeleccionado,
        altura: this.formHistoria.get('altura')!.value,
        peso: this.formHistoria.get('peso')!.value,
        temperatura: this.formHistoria.get('temperatura')!.value,
        presion: this.formHistoria.get('presion')!.value
      }
    )
    .then
      (
        ({data, error}) => 
          {
            if (error)
            {
              console.error(error.message, error.code);              
            }

            this.restart()
            this.showSpinner = false;
            this.showFormHistoria = false;

          }
      )
  }

  recibirRespuestaCaptcha(respuesta: boolean)
  {
    this.captchaValido = respuesta;
  }


}
