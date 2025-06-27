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
    RouterLink
  ]
})
export class UsersComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Usuario>;
  private supabaseService = inject(SupaService);
  protected showSpinner: boolean = false;
  dataSource = new UsersDataSource([]);

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
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
          this.refresh();
          
          
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
    this.table.renderRows();
    
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
  
}
