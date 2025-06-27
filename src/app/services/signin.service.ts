import { EventEmitter, Injectable } from '@angular/core';
import { SupaService } from './supa.service';
import { User } from '@supabase/supabase-js';
import { Usuario } from '../models/usuario.models';

@Injectable({
  providedIn: 'root'
})
export class SigninService {
  public isLogged: boolean = false;
  public user?: User;
  public userRole: string = 'invitado'
  public emitter = new EventEmitter<User>();

  constructor(private supaService: SupaService)
  {
  }

  public getUser()
  {
    this.supaService.supabase.auth.getUser().then(({data}) =>
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

  
  getRole()
  {
    if (this.user)
    {
      this.supaService.supabase.from('users')
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
          }
        }
      )
    }
  }
}
