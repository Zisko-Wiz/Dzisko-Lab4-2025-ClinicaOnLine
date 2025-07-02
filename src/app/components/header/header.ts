import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupaService } from '../../services/supa.service';
import { SigninService } from '../../services/signin.service';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-header',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy
{

  public ingreso: Boolean = false;
  public mensajeBienvenida? : string = 'Bienvenido a la Clínica OnLine';
  public subscription!: Subscription;
  public logginEmmiter = new EventEmitter<boolean>();
  constructor( private router: Router, private supa: SupaService, protected signInService: SigninService){}

  ngOnInit(): void
  {
    this.signInService.especialidades = "";
    this.getUser();

    this.signInService.getUser()
    .then( () => {this.signInService.getUsuario()
      .then( () => {this.signInService.getEspecialidades()
        .then( () => {this.signInService.getHorarios()
          .then( () => {this.signInService.getAvatarUrl()
         })
       })
      })
    });
  }

  ngOnDestroy(): void
  {
    this.subscription.unsubscribe();
    this.signInService.especialidades = "";
  }

  public async logOut()
  {
    this.supa.supabase.auth.signOut().then(({ error }) =>
    {
      if (error)
      {
        console.error('Error: ', error.message)
      }else{
        this.signInService.getUser();
        this.ingreso = false;
        this.mensajeBienvenida = "";
        this.signInService.especialidades = "";
        this.router.navigate(["home"]);
      }
    });
  }

  public getUser()
  {
    this.subscription = this.signInService.emitter
    .subscribe(
    {
      next: (data: User) =>
      {
        if (data != undefined)
        {
          this.ingreso = true;
        }
      }
    })
  }
  private async setWelcomeMessage()
  {
    if (this.signInService.user != undefined)
    {
      const { data, error } = (await this.supa.supabase.from('users')
      .select('nickname')
      .eq('uid',this.signInService.user?.id));

      let nick = data![0].nickname;
      let nombreCapitalized: string = nick![0].toUpperCase() + nick!.slice(1);
      this.mensajeBienvenida = "Bienvenido " + nombreCapitalized;
    }
  }
}

