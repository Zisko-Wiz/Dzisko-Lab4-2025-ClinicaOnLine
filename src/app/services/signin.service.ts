import { EventEmitter, Injectable } from '@angular/core';
import { SupaService } from './supa.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SigninService {
  public isLogged: boolean = false;
  public user?: User;
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
    });
  }
}
