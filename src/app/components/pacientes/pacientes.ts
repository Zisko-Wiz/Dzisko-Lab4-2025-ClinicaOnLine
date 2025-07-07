import { Component, inject, OnInit } from '@angular/core';
import { SupaService } from '../../services/supa.service';
import { SigninService } from '../../services/signin.service';
import { Turno } from '../../models/turno';
import { MatCardModule } from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import { Header } from '../header/header';
import { NombrePipe } from "../../pipes/nombre-pipe";
import { Usuario } from '../../models/usuario.models';
import { AvatarURL } from '../../directives/avatar-url';
import { MostrarHistorial } from '../../directives/mostrar-historial';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pacientes',
  imports: [
    Header,
    MatCardModule,
    MatDividerModule,
    NombrePipe,
    AvatarURL,
    MatProgressSpinnerModule,
    MostrarHistorial,
    DatePipe
],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.scss'
})
export class Pacientes implements OnInit
{
  private supaService = inject(SupaService);
  private signInService = inject(SigninService);
  protected historiasClinicas: any[] = [];
  protected datosDinamicos: any[] = [];
  protected pacientes: any[] = [];
  protected todosUsuarios : Usuario[] = [];
  protected listaFinal: any[] = [];
  protected loading: boolean = true;
  

  ngOnInit(): void
  {
    this.restart();
  }

  async getUsuarios()
  {
    return this.supaService.supabase
    .from('users')
    .select()
    .eq('role', 'paciente')
    .then(
      ({data, error}) =>
      {
        if (error)
        {
          console.error(error.message, error.code);
                   
        } else
        {
          this.todosUsuarios = data;
        }
      }
    )
  }

 crearListaFinal()
  {
        
    for (let index = 0; index < this.todosUsuarios.length; index++)
    {
      var count = 0;
      var t: Turno[] = [];
      for (let index2 = 0; index2 < this.pacientes.length; index2++)
      {
        if (this.pacientes[index2].email_paciente == this.todosUsuarios[index].email )
        {
          count += 1;
          t.push(this.pacientes[index2])
        }

        if (count == 3)
        {
          count = 0;
          break;  
        }
        
      }
      if (t.length > 0)
      {
        this.listaFinal.push(t);        
      }
    }

    console.log(this.listaFinal);
    this.loading = false;
  }

  restart()
  {
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
            .then( () =>
            {
              this.getUsuarios().then( () =>
              {
                this.crearListaFinal();
              })
            })
          })
        })
      })
    })
  }

  async getHistoriasClinicas()
  {
    return this.supaService.supabase.from('historia')
    .select()
    .order('fecha', { ascending: true })
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
  async getDatosDinamicos()
  {
    return this.supaService.supabase.from('datos_dinamicos')
    .select()
    .order('fecha', { ascending: true })
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

  async getTurnos(email:string)
  {
    return this.supaService.supabase
    .from('turnos')
    .select(
      `
      *,
      users(firstname, surname)
      `
    )
    .eq('email_esp', email)
    .eq('estado', 'finalizado')
    .order('fecha', { ascending: true })
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

          this.pacientes = dataSource;
        }
      }
    )
  }

  getAvatarURL(emailPaciente: string)
  {
    let email = emailPaciente.split('@')
    return `${email[0]}-1`
  }


}
