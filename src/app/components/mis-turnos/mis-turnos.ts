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
    MatSlideToggleModule
  ],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.scss'
})
export class MisTurnos implements AfterViewInit, OnInit
{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Turno>;
  private supabaseService = inject(SupaService);
  private signInService = inject(SigninService);
  protected showSpinner: boolean = false;
  protected showFormHistoria: boolean = false;
  protected todosUsuarios : Usuario[] = [];
  dataSource? :any;
  formHistoria = new FormGroup(
    {
      altura: new FormControl('', [Validators.required]),
      peso: new FormControl('', [Validators.required]),
      temperatura: new FormControl('', [Validators.required]),
      presion: new FormControl('', [Validators.required]),
      clave1: new FormControl(''),
      valor1: new FormControl(''),
      clave2: new FormControl(''),
      valor2: new FormControl(''),
      clave3: new FormControl(''),
      valor3: new FormControl(''),
      clave4: new FormControl(''),
      valor4a: new FormControl(0),
      valor4b: new FormControl(100),
      clave5: new FormControl(''),
      valor5: new FormControl('', [Validators.pattern(/^\d+$/)]),
      clave6: new FormControl(''),
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
                      'verHistoria'
                    ];

  ngOnInit(): void
  {
    this.signInService.getUser()
    .then( () => {this.signInService.getUsuario()
      .then( () => {this.getTurnos(this.signInService.usuario!.email)})
      
    });

    this.getUsuarios();
  }

  getTurnos(email:string)
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
          console.log(error.message);          
        } else
        {
          var dataSource = [];
          for (let index = 0; index < data.length; index++)
          {
            let t = new Turno(data[index].fecha, data[index].email_esp, data[index].email_paciente, data[index].especialidad, data[index].estado, data[index].comentario, data[index].users.firstname, data[index].users.surname, data[index].calificacion);
            dataSource.push(t)
          }
          this.dataSource = new MatTableDataSource(dataSource);
          this.refresh();
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
          console.log(error.message);          
        } else
        {
          this.todosUsuarios = data;
          this.refresh();
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

  ngAfterViewInit(): void {
    this.dataSource!.sort = this.sort;
    this.dataSource!.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  refresh()
  {
    this.dataSource!.sort = this.sort;
    this.dataSource!.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
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

  crearHistoriaClinica()
  {}

  subirHistoriClinica()
  {}

}
