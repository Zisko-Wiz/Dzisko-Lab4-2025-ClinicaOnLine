import { inject, Pipe, PipeTransform } from '@angular/core';
import { SupaService } from '../services/supa.service';
import { Usuario } from '../models/usuario.models';

@Pipe({
  name: 'nombre'
})
export class NombrePipe implements PipeTransform
{
  transform(email: string,usuarios: Usuario[])
  {
    let usrIndex = usuarios.findIndex( (user) => {return user.email == email} );

    return `${usuarios[usrIndex].firstname} ${usuarios[usrIndex].surname}`
  }

}
