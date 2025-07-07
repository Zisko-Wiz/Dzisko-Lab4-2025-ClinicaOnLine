import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'verificacion'
})
export class VerificacionPipe implements PipeTransform {


  
  transform(valor: boolean): string | null
  {
    
    switch (valor)
    {
      case true:
        return 'VERIFICADO'
    
      case false:
        return 'NO VERIFICADO'
    }
    return null;
  }

}
