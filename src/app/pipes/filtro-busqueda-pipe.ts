import { Pipe, PipeTransform } from '@angular/core';
import { Usuario } from '../models/usuario.models';

@Pipe({
  name: 'filtroBusqueda'
})
export class FiltroBusquedaPipe implements PipeTransform {

  transform(usuarios: Usuario[], busqueda: string): Usuario[] {
    return usuarios.filter(usuario => usuario.firstname.toLowerCase().includes(busqueda.toLowerCase()));
  }

}
