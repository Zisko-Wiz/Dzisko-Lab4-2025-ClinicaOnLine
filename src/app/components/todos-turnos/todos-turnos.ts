import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { Header } from '../header/header';
import { MatButtonModule } from '@angular/material/button';
import { Usuario } from '../../models/usuario.models';
import { SupaService } from '../../services/supa.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Turno } from '../../models/turno';
import { DatePipe } from '@angular/common';
import { NombrePipe } from '../../pipes/nombre-pipe';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Remarcar } from '../../directives/remarcar';


@Component({
  selector: 'app-todos-turnos',
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
    Remarcar
  ],
  templateUrl: './todos-turnos.html',
  styleUrl: './todos-turnos.scss'
})
export class TodosTurnos implements AfterViewInit, OnInit{

@ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Turno>;
  private supabaseService = inject(SupaService);
  protected showSpinner: boolean = false;
  protected todosUsuarios : Usuario[] = [];
  dataSource? :any;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
                      'fecha',
                      'email_esp',
                      'firstname',
                      'surname',
                      'especialidad',
                      'email_paciente',
                      'estado',
                      'action',
                      'comment'
                    ];

  ngOnInit(): void
  {
    this.getTurnos();
    this.getUsuarios();
  }

  getTurnos()
  {
    this.supabaseService.supabase
    .from('turnos')
    .select(
      `
      *,
      users(firstname, surname)
      `
    ).then(
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
  
  onActionButtonClick(event: Event, eventData: Turno, rowIndex: number)
  {
    this.showSpinner = true;
    let a = this.dataSource.data.find(( trn: Turno ) => { return trn.fecha == eventData.fecha} );
    a!.estado = "cancelado";
    this.cancelTurno(a!.fecha, a!.estado, a.comentario)
    this.table.renderRows();
    
  }

  private cancelTurno(fecha:string, newEstado: boolean, comentario:string)
  {
    this.supabaseService.supabase
    .from('turnos')
    .update({ estado: newEstado, comentario: comentario })
    .eq('fecha', fecha).then(
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
  
}
