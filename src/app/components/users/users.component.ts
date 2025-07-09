import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { UsersDataSource} from './users-datasource';
import { Header } from '../header/header';
import { MatButtonModule } from '@angular/material/button';
import { Usuario } from '../../models/usuario.models';
import { SupaService } from '../../services/supa.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import * as XLSX from 'xlsx';
import { VerificacionPipe } from '../../pipes/verificacion-pipe';
import { Remarcar } from '../../directives/remarcar';
import { Verificar } from '../../directives/verificar';
import { RemarcarRol } from '../../directives/remarcar-rol';
import { BaseChartDirective } from 'ng2-charts';
import { HistoriaComponent } from '../historia/historia';
import { Historia } from '../../models/historia.models';
import {MatIconModule} from '@angular/material/icon';
import { AvatarURL } from '../../directives/avatar-url';
import { NombrePipe } from '../../pipes/nombre-pipe';
const { read, utils } = XLSX;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    Header,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
    VerificacionPipe,
    Verificar,
    RemarcarRol,
    HistoriaComponent,
    MatIconModule,
    AvatarURL,
    NombrePipe
]
})
export class UsersComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Usuario>;
  private supabaseService = inject(SupaService);
  protected showHistorias: boolean = false;
  protected showSpinner: boolean = false;
  protected historiaCLinica: Historia[] = [];
  private logs?: any[];
  dataSource = new UsersDataSource([]);
  users : Usuario[] = [];

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
                      'historial',
                      'role',
                      'firstname',
                      'surname',
                      'dni',
                      'age',
                      'email',
                      'obra_social',
                      'verification',
                      'action'
                    ];

  ngOnInit(): void
  {
    this.getUsers();
  }

  getUsers()
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
          this.dataSource = new UsersDataSource(data);
          this.users = data;
          this.refresh();
        }
      }
    )
  }

  async getLogs()
  {
    return this.supabaseService.supabase
    .from('ingresos')
    .select(
      `
        created_at,
        usuario
      `
    ).then(
      ({data, error}) =>
      {
        if (error)
        {
          console.log(error.message);
        } else {          
          this.logs = data;
          console.log(this.logs);
        }
      }
    )
  }
  
  onActionButtonClick(event: Event, eventData: Usuario, rowIndex: number)
  {
    this.showSpinner = true;
    let a = this.dataSource.data.find(( usr ) => { return usr.email == eventData.email} );
    a!.verification = !a?.verification;
    this.changeVerification(a!.email, a!.verification)
    this.refresh();
    this.table.renderRows();
  }

  protected mostrarHistorial(emailPaciente: string)
  {
    this.showSpinner = true;
    this.getHistoriaClinica(emailPaciente)
    .then
    (
      () =>
      {
        this.showHistorias = true;
        this.showSpinner = false;
      }  
    );
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

  private changeVerification(email:string, newVerificaition: boolean)
  {
    this.supabaseService.supabase
    .from('users')
    .update({ verification: newVerificaition })
    .eq('email', email).then(
      () => { this.showSpinner = false;}
    )
  }

  protected descargarHojaCalculo()
  {
    var worksheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    XLSX.utils.sheet_add_aoa(worksheet, [["ID", "Fecha_Creación", 'Nombre', 'Apellido', 'DNI', 'Edad', 'Verificación', 'Rol', 'Email', 'Obra Social']], { origin: "A1" })

    if(!worksheet["!cols"]) worksheet["!cols"] = [];
    if(!worksheet["!cols"][1]) worksheet["!cols"][1] = {wch: 8};
    if(!worksheet["!cols"][6]) worksheet["!cols"][6] = {wch: 8};
    if(!worksheet["!cols"][2]) worksheet["!cols"][2] = {wch: 8};
    if(!worksheet["!cols"][3]) worksheet["!cols"][3] = {wch: 8};
    if(!worksheet["!cols"][7]) worksheet["!cols"][7] = {wch: 8};
    if(!worksheet["!cols"][8]) worksheet["!cols"][8] = {wch: 8};
    if(!worksheet["!cols"][9]) worksheet["!cols"][9] = {wch: 8};
    if(!worksheet["!cols"][4]) worksheet["!cols"][4] = {wch: 8};
    worksheet["!cols"][4].wpx = 90;
    worksheet["!cols"][9].wpx = 87;
    worksheet["!cols"][8].wpx = 227;
    worksheet["!cols"][7].wpx = 105;
    worksheet["!cols"][3].wpx = 95;
    worksheet["!cols"][2].wpx = 95;
    worksheet["!cols"][1].wpx = 200;
    worksheet["!cols"][6].wpx = 88;


    var workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usr");
    XLSX.writeFile(workbook, "Usuarios.xlsx", { compression: true });
  }

  protected descargarLogs()
  {
    this.getLogs().then
    (
      () =>
      {
        var worksheet = XLSX.utils.json_to_sheet(this.logs!);
        XLSX.utils.sheet_add_aoa(worksheet, [["Fecha_Ingreso", "Usuario"]], { origin: "A1" })

        if(!worksheet["!cols"]) worksheet["!cols"] = [];
        if(!worksheet["!cols"][0]) worksheet["!cols"][0] = {wch: 8};
        if(!worksheet["!cols"][1]) worksheet["!cols"][1] = {wch: 8};
        worksheet["!cols"][0].wpx = 200;
        worksheet["!cols"][1].wpx = 227;

        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "log");
        XLSX.writeFile(workbook, "Registro.xlsx", { compression: true });

      }
    )
  }
  
  protected async getHistoriaClinica(emailPaciente: string)
  {
    return this.cargarHistoriaCLinica(emailPaciente)
    .then
    ( () =>
        {
          this.agregarDatosDinamicos(emailPaciente)
          .then
          (
            () => 
            {
              this.showSpinner = false;
            }
          );
        }
    )
  }

  private async cargarHistoriaCLinica(emailPaciente: string)
  {
    this.showSpinner = true;
    return this.supabaseService.supabase
    .from('historia')
    .select()
    .eq('email_paciente', emailPaciente)
    .then
    (
      ( {data, error} ) => 
      {
        if (error)
        {
          console.error(error.message, error.code);            
        } else {
          this.historiaCLinica = data;
        }
      }
    )
  }

  private async agregarDatosDinamicos(emailPaciente: string)
  {
    if (this.historiaCLinica.length > 0)
    {
      return this.supabaseService.supabase
      .from('datos_dinamicos')
      .select()
      .eq('email_paciente', emailPaciente)
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

  getAvatarURL(emailPaciente: string)
  {
    let email = emailPaciente.split('@')
    return `${email[0]}-1`
  }

}
