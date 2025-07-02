import { AfterContentInit, AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Usuario } from '../../models/usuario.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-turnos',
  imports: [
    Header,
    MatTooltipModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: './turnos.html',
  styleUrl: './turnos.scss'
})
export class Turnos implements OnInit, OnDestroy, AfterViewInit, AfterContentInit
{
  private supabaseService = inject(SupaService);
  private signInService = inject(SigninService);
  private router = inject(Router);
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
  protected turnosSacados: Turno[] = [];
  protected horariosDelEspecialista: any[] = [];
  protected loading : boolean = true;
  paciente = new FormControl("", [Validators.required]);
  protected fechaSeleccionada: string = "";
  protected isAdmin: boolean = false;
  protected pacientes?: Usuario[];
  protected pacienteEscogido: string | undefined = "";

  ngOnInit(): void
  {
    this.signInService.getUser()
    .then( () => 
      {this.signInService.getUsuario()
        .then( () => 
        {
          this.signInService.getRole();
        })
          .then( () => 
          {
            if (this.signInService.userRole == "administrador")
            {
              this.getPacientes();
            } else {
              
              this.pacienteEscogido = this.signInService.usuario?.email;
            }
          })
      })


    // this.signInService.getUser().then(
    //   () => {
        
    //     if (this.signInService.userRole == "administrador")
    //     {
    //       this.getPacientes();
    //     } else {
          
    //       this.pacienteEscogido = this.signInService.usuario?.email;
    //     }
      
    //   })

    this.horariosSubscription = this.signInService.horarioEmitter.subscribe
    ({
      next: (data: Horario[]) =>
      {
        if (data != undefined)
        {
          this.horarios = data;
        }        
      }
    });

      

    this.getEspecialidades();  
    this.setProximosDias();
  }

  ngOnDestroy(): void
  {
    this.horariosSubscription?.unsubscribe();   
  }

  ngAfterViewInit(): void
  {
    this.loading = false;  
  }

  ngAfterContentInit(): void
  {
    this.loading = false;  
  }

  setProximosDias()
  {
    let now = DateTime.now().startOf('day').plus({ hours: 8});
    let later = now.plus({ days: 16 });
    let i = Interval.fromDateTimes(now, later);

    let d = Duration.fromObject({ days: 1});
    let days = i.splitBy(d)


    var hor = [];

    for (let index = 0; index < days.length; index++)
    {
      hor.push(days[index].splitAt(days[index].end!.minus({hour: 13, minute:30}))[0]);
    }

    this.proximosDias = hor;
    this.loading = false;
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

  protected async getPacientes()
  {
    return this.supabaseService.supabase.from('users')
    .select()
    .eq('role', 'paciente')
    .then(
      ( {data, error} ) => { 
        if (error)
        {
          console.log(error.message);
        } else {
          this.pacientes = data;
          this.isAdmin = true;
        }
      }
    )
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
          this.loading = false;
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

  protected escogerPaciente(emailPaciente: string)
  {
    this.pacienteEscogido = emailPaciente;
    this.isAdmin = false;
  }

  protected escogerEspecialidad(esp: string)
  {
    this.loading = true;
    this.especialidadEscogida = esp;
    this.getEspecialistas();
  }

  protected escogerEspecialista(esp: string)
  {
    this.loading = true;
    this.especialistaEscogido = esp;
    this.getTurnos(esp).then( () => {this.getTurnosSacados(esp);});
  }

  protected isHorarioDisponible(intervalo: any) : boolean
  {
    var t = intervalo.start.toISO();
    var dia = intervalo.start.weekday;
    var hora = DateTime.fromFormat(intervalo.start.toFormat('HH:mm'), 'HH:mm')

    if (this.turnosSacados?.length == 0)
    {
      return true;  
    }

    for (let index = 0; index < this.horarios!.length; index++)
    {
      var horaInicial = DateTime.fromFormat(this.horarios![index].hora_inicial,'HH:mm');
      var horaFinal = DateTime.fromFormat(this.horarios![index].hora_final,'HH:mm');
      var horInterval = Interval.fromDateTimes(horaInicial, horaFinal);

      switch (this.horarios![index].dia)
      {
        case 'lunes':
          if (dia == 1 && !horInterval.contains(hora))
          {
            return false;
          }
          break;

        case 'martes':
          if (dia == 2 && !horInterval.contains(hora))
          {
            return false;
          }
          break;

        case 'miércoles':
          if (dia == 3 && !horInterval.contains(hora))
          {
            return false;
          }
          break;

        case 'jueves':
          if (dia == 4 && !horInterval.contains(hora))
          {
            return false;
          }
          break;

        case 'viernes':
          if (dia == 5 && !horInterval.contains(hora))
          {
            return false;
          }
          break;

        case 'sábado':
          if (dia == 6 && !horInterval.contains(hora))
          {
            return false;
          }
          break;
      }
    }

    for (let index = 0; index < this.turnosSacados.length; index++)
    {
      if (t == `${this.turnosSacados[index].fecha}.000+00:00`)
      {
        return false;  
      }
    }

    return true;
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

    this.loading = false;
    
  }

  insertTurno()
  {
    this.loading = true;
    this.supabaseService.insertTurno(this.fechaSeleccionada, this.especialistaEscogido, this.pacienteEscogido!, this.especialidadEscogida)
    .then(
      ( {data, error}) => {
        if (error)
        {
          console.log(error.message);            
        } else {
          this.router.navigate(["home"])
        }
      }
    )
  }
}
