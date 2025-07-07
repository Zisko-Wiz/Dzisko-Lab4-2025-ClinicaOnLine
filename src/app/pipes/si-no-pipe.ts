import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'siNo'
})
export class SiNoPipe implements PipeTransform {

  transform(valor: boolean | null): string | null
  {
    
    switch (valor) 
    {
      case true:
        return 'Sí'
    
      case false:
        return 'No'
    }

    return null;
  }

}
