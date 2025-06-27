import { inject, Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Usuario } from '../models/usuario.models';
import { SigninService } from './signin.service';


@Injectable({
  providedIn: 'root'
})
export class SupaService
{
  supabase = createClient(environment.apiUrl, environment.publicAnonKey);

  uploadAvatar(filePath: string, file: any)
  {
    return this.supabase.storage.from('profile-pictures').upload(filePath, file)
  }

}
