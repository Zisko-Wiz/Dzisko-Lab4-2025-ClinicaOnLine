import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'historiaClinica'
})
export class HistoriaClinicaPipe implements PipeTransform {

  transform(emailPaciente: string, historiasClinicas: any[]): string | null
  {
    var histActual = historiasClinicas.find( (hist) => { return hist.email_paciente == emailPaciente});

    if ( histActual)
    {
      return `Altura: ${histActual.altura}\nPeso: ${histActual.peso}\nTemperatura: ${histActual.temperatura}\nPresión: ${histActual.presion}`
    }

    return null;
  }

}
