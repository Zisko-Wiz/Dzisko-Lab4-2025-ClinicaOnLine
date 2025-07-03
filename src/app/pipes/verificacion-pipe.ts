import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'verificacion'
})
export class VerificacionPipe implements PipeTransform {


  
  transform(valor: boolean): unknown
  {
    
    switch (valor) {
      case true:
        return 'VERIFICADO'
        break;
    
      case false:
        return 'NO VERIFICADO'
    }
    return null;
  }

}
