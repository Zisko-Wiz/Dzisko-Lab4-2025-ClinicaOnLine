import { EventEmitter, Injectable } from '@angular/core';
import { SupaService } from './supa.service';
import { User } from '@supabase/supabase-js';
import { Usuario } from '../models/usuario.models';
import { Horario } from '../models/horario';

@Injectable({
  providedIn: 'root'
})
export class SigninService {
  public isLogged: boolean = false;
  public user?: User;
  public usuario?: Usuario;
  public userRole: string = 'invitado';
  public especialidades: string = "";
  public emitter = new EventEmitter<User>();
  public horarioEmitter = new EventEmitter<Horario[]>();
  public avatarURL1: string = "";
  public avatarURL2: string = "";
  public horarios?: Horario[];


  constructor(private supaService: SupaService)
  {
  }

  public async getUser()
  {
    return this.supaService.supabase.auth.getUser().then(({data}) =>
    {       
      if (data.user != null)
      {
        this.user = data.user;
        this.isLogged = true;
        this.emitter.emit(data.user);
      }
      else
      {
        this.isLogged = false;
        this.emitter.emit(undefined);
      }
    }).finally(
      () => {
        this.getRole();
      }
    );
  }

  
  async getRole()
  {
    if (this.user)
    {
      return this.supaService.supabase.from('users')
      .select()
      .eq('email', this.user.email)
      .then(
        ( {data, error} ) => {

          if (error)
          {
            console.log(error.message);
          } else 
          {
            this.userRole = data![0].role;
            this.getUsuario();
          }
        }
      )
    }
  }

  async getUsuario()
  {
    if (this.user)
    {
      return this.supaService.supabase.from('users')
      .select()
      .eq('email', this.user.email)
      .then(
        ( {data, error} ) => {

          if (error)
          {
            console.log(error.message);
          } else 
          {
            this.usuario = data[0];
          }
        }
      )
    }
  }

  async getEspecialidades()
  {
    if (this.usuario?.role == "especialista")
    {
      return this.supaService.supabase.from('users')
      .select(
        `
        especialidades (nombre)
        `
      )
      .eq("email", "demekoj370@iridales.com")
      .then(
        ( {data, error} ) =>{
          if (error)
          {
            console.log(error);
          } else {
            this.especialidades = "";
              for (let index = 0; index < data[0].especialidades.length; index++)
              {
                if (index == 0)
                {
                  this.especialidades += `${data[0].especialidades[index].nombre}`
                } else {
                  this.especialidades += `, ${data[0].especialidades[index].nombre}`
                }
              }
          }
        }
      )
    }
  }

  getAvatarUrl()
  {
    if (this.usuario?.email != undefined)
    {  
      var email = this.usuario?.email.split('@');
      var path = `${email![0]}-1`
      var { data } = this.supaService.supabase.storage.from('profile-pictures').getPublicUrl(path)
      this.avatarURL1 = data.publicUrl;
    
      if (this.usuario?.role == "paciente")
      {
        path = `${email![0]}-2`
        var { data } = this.supaService.supabase.storage.from('profile-pictures').getPublicUrl(path)
        this.avatarURL2 = data.publicUrl;    
      }
    }
  }

  async getHorarios()
  {
    if (this.usuario != undefined)
    {
     return this.supaService.supabase.from('horarios')
      .select()
      .eq("email_esp", this.usuario?.email).then(
        ({data, error}) => {
          if (error)
          {
            console.log(error.message);
          } else {
            this.horarioEmitter.emit(data)
          }
        }
      )
    }
  }

  async getHorariosByEmail(email: string)
  {
    return this.supaService.supabase.from('horarios')
    .select()
    .eq("email_esp", email)
    .then(
      ({data, error}) => {
        if (error)
        {
          console.log(error.message);
        } else {
          this.horarioEmitter.emit(data)
        }
      }
    )
  }

    
}
