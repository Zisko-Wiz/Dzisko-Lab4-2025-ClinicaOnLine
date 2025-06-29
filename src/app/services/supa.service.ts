import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';


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

  insertHorarios(email:string|undefined, dia: string, horaInicial:string, horaFinal:string )
  {
    
    if (typeof email == "string")
    {
      this.supabase.from('horarios').insert
      ({
        email_esp: email,
        dia: dia,
        hora_inicial: horaInicial,
        hora_final: horaFinal
      }).then(({data, error})=> {
        if (error?.code == "23505")
        {
          this.updateHorario(email,dia,horaInicial,horaFinal);  
        } else {
          
        }
      })
    }

  }

  updateHorario(email:string|undefined, dia: string, horaInicial:string, horaFinal:string)
  {
    this.supabase.from('horarios').update(
      {
        hora_inicial: horaInicial,
        hora_final: horaFinal
      }
    ).eq('email_esp', email)
    .eq('dia', dia).then()
  }

}
