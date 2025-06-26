import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { SupaService } from '../../services/supa.service';

@Component({
  selector: 'app-login',
  imports: [
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit
{
  private supabaseService = inject(SupaService);
  private router = inject(Router);
  protected error: boolean = true;
  protected errorInvalido: boolean = false;
  protected errorNoConfirmado: boolean = false;
  protected verificated: boolean | null = null;

  loginForm = new FormGroup(
  {
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(6)]),
  });

  ngOnInit(): void
  {
    
  }

  protected getVerification()
  {
    this.supabaseService.supabase.from('users')
    .select('verification')
    .eq('email', this.loginForm.get('email')?.value as string)
    .then( ({data, error}) => 
      {
        if (error)
        {
          console.log(error.message);
          console.log(error.code);            
        } else {
          this.verificated = data[0].verification;
        }
      })
  }

  login()
  {
    this.supabaseService.supabase.auth.signInWithPassword
    ({
      email: this.loginForm.get('email')?.value as string,
      password: this.loginForm.get('password')?.value as string
    }
    ).then(({ data, error}) => {

      this.errorInvalido = false;
      this.errorNoConfirmado = false;

      if (error)
      {
        console.log(error.code);
        
        switch (error.code) {
          case "email_not_confirmed":
            this.errorNoConfirmado = true;
            break;
        
          default:
            break;
            
            case 'invalid_credentials':
              this.errorInvalido = true;
              break
          }

      }else{
        this.supabaseService.supabase.from('ingresos').insert([
          {
            usuario: data.user.email
          }
        ]).then(({error}) =>
        {
          if (error == null)
          {
            this.router.navigate(['/home']);
          }
        }
      )}
    });
  }

  protected ingresar()
  {
    this.getVerification();

    if (this.verificated)
    {
      this.login()  
    }
  }
}
