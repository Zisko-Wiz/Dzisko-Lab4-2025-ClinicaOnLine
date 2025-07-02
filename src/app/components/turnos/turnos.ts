import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SupaService } from '../../services/supa.service';
import { Especialidad } from '../../models/especialidad.models';
import { Header } from '../header/header';
import { MatTooltipModule } from '@angular/material/tooltip';
import { interval, Subscription } from 'rxjs';
import { Horario } from '../../models/horario';
import { SigninService } from '../../services/signin.service';
import { DateTime, Duration, Interval } from 'luxon'
import { Turno } from '../../models/turno';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-turnos',
  imports: [
    Header,
    MatTooltipModule,
    MatSelectModule
  ],
  templateUrl: './turnos.html',
  styleUrl: './turnos.scss'
})
export class Turnos implements OnInit, OnDestroy
{
  private supabaseService = inject(SupaService);
  private signInService = inject(SigninService);
  private horariosSubscription?: Subscription;
  protected especialidades :Especialidad[] = [];
  protected especialidadEscogida: string = "";
  protected especialistaEscogido: string = "";
  protected especialistas?: { users: { firstname: any; surname: any; email: any; }[]; } | null;
  protected especialistasCargados: boolean = false;
  protected turnosCargados: boolean = false;
  protected horariosCargados: boolean = false;
  protected horarios?: Horario[];
  protected proximosDias?: any[];
  protected turnosSacados?: Turno[];
  protected horariosDelEspecialista: any[] = [];

  ngOnInit(): void
  {
    this.getEspecialidades();  
    this.setProximosDias();

    this.horariosSubscription = this.signInService.horarioEmitter.subscribe(
    {
      next: (data: Horario[]) =>
      {
        if (data != undefined)
        {
          this.horarios = data;
        }        
      }
    });

  }

  ngOnDestroy(): void
  {
    this.horariosSubscription?.unsubscribe();   
  }

  setProximosDias()
  {
    let now = DateTime.now().startOf('day').plus({ hours: 11}).setZone('America/Argentina/Buenos_Aires');
    let later = now.plus({ days: 16 }).setZone('America/Argentina/Buenos_Aires');
    let i = Interval.fromDateTimes(now, later);

    let d = Duration.fromObject({ days: 1});
    let days = i.splitBy(d)


    var hor = [];

    for (let index = 0; index < days.length; index++)
    {
      // console.log(days[index].splitAt(days[index].end!.minus({hour: 13, minute:30}))[0].toFormat(
      //   'dd/MM HH:mm'
      // ));
      
      hor.push(days[index].splitAt(days[index].end!.minus({hour: 13, minute:30}))[0]);
    }

    this.proximosDias = hor;
    
  }

  getTurnosSacados(emailEsp: string)
  {
    this.supabaseService.supabase.from('turnos')
    .select()
    .eq('email_esp', emailEsp)
    .then(
      ({data, error}) =>
      {
        if (error)
        {
          console.log(error.message);
        } else {
          this.turnosSacados = data as Turno[];
          this.setHorariosDisponibles();
        }
      }
    )
  }

  private getEspecialidades()
  {
    this.supabaseService.supabase.from('especialidades')
    .select('*')
    .then( ({data, error}) => 
    {
      if (error)
      {
        console.log(error.message);
        console.log(error.code);            
      } else {
        this.especialidades = data;
      }
    })
  }

  protected getEspecialistas()
  {
    this.supabaseService.supabase.from('especialidades')
    .select(`
      users (firstname, surname, email)
      `)
    .eq('nombre', this.especialidadEscogida)
    .then(
    ( {data, error} ) => 
      {
        if (!error)
        {
          this.especialistas = data[0];
          this.especialistasCargados = true;
        } else {
          console.log(error.message);
        }
      }
    );
  }

  protected getAvatarUrl(email: string) : string
  {
    let path = email.split('@');
    var {data} = this.supabaseService.supabase.storage
      .from('profile-pictures')
      .getPublicUrl(`${path[0]}-1`);

    return data.publicUrl;
  }

  private async getTurnos(especialista:string)
  {
    return this.signInService.getHorariosByEmail(especialista).then( () => {this.horariosCargados = true;})
  }

  protected escogerEspecialidad(esp: string)
  {
    this.especialidadEscogida = esp;
    this.getEspecialistas();
  }

  protected escogerEspecialista(esp: string)
  {
    this.especialistaEscogido = esp;
    this.getTurnos(esp).then( () => {this.getTurnosSacados(esp);});
  }

  setHorariosDisponibles()
  {
    var diasDelEspecialista = [];
    var d = Duration.fromObject({ minutes: 30});

    for (let index = 0; index < this.proximosDias!.length; index++)
    {
      for (let index2 = 0; index2 < this.horarios!.length; index2++)
      {
        switch (this.horarios![index2].dia)
        {
          case 'lunes':
            if (this.proximosDias![index].start.weekday == 1)
            {
              diasDelEspecialista!.push(this.proximosDias![index]);  
            }
            break;

          case 'martes':
            if (this.proximosDias![index].start.weekday == 2)
            {
              diasDelEspecialista!.push(this.proximosDias![index]);  
            }
            break;

          case 'miércoles':
            if (this.proximosDias![index].start.weekday == 3)
            {
              diasDelEspecialista!.push(this.proximosDias![index]);  
            }
            break;

          case 'jueves':
            if (this.proximosDias![index].start.weekday == 4)
            {
              diasDelEspecialista!.push(this.proximosDias![index]);  
            }
            break;

          case 'viernes':
            if (this.proximosDias![index].start.weekday == 5)
            {
              diasDelEspecialista!.push(this.proximosDias![index]);  
            }
            break;

          case 'sábado':
            if (this.proximosDias![index].start.weekday == 6)
            {
              diasDelEspecialista!.push(this.proximosDias![index]);  
            }
            break;
        }
      }
    }

    for (let index = 0; index < diasDelEspecialista.length; index++)
    {
      this.horariosDelEspecialista.push(diasDelEspecialista[index].splitBy(d))
    }

    console.log(this.horariosDelEspecialista);
    
  }
}
