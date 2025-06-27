import { Component, inject, input, OnInit } from '@angular/core';
import { ReactiveFormsModule, Validators, FormGroup, FormControl, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { SupaService } from '../../services/supa.service';
import { Router, RouterLink } from '@angular/router';
import { Especialidad } from '../../models/especialidad.models';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SigninService } from '../../services/signin.service';
import { Header } from '../header/header';


@Component({
  selector: 'app-form-registro',
  templateUrl: './form-registro.component.html',
  styleUrl: './form-registro.component.scss',
  imports: [
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    ReactiveFormsModule,
    RouterLink,
    FormsModule,
    MatProgressSpinnerModule,
    Header
  ]
})
export class FormRegistroComponent implements OnInit
{
  private router = inject(Router);
  protected signInService = inject(SigninService);
  protected showSpinner: boolean = true;
  protected errorUsuarioExiste : boolean = false;
  protected showForm: boolean = false;
  protected formMode: number = 0;
  private supabaseService = inject(SupaService);
  protected avatar1? : any;
  protected avatar1path? : any;
  protected avatar1URL : any;
  protected avatar2? : any;
  protected avatar2path? : any;
  protected avatar2URL : any;
  protected message?: string;
  protected nuevaEspecialidad: string = "";
  protected especialidades: any[] = [];
  protected lastEspecialidadesId: number = -1;
  protected obrasSociales : any[] = [];
  protected email: string = "";
  protected password: string = "";
  signupForm = new FormGroup(
  {
    firstName: new FormControl("", [Validators.pattern(/^[\p{Letter}\p{Mark}]+$/u), Validators.required]),
    lastName: new FormControl("", [Validators.pattern(/^[\p{Letter}\p{Mark}]+$/u), Validators.required]),
    edad: new FormControl("", [Validators.pattern(/^\d+$/), Validators.min(18), Validators.max(99), Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(6)]),
    dni: new FormControl("", [Validators.required, Validators.pattern(/^\d+$/)]),
    obraSocial: new FormControl("", [Validators.required]),
    especialidad: new FormControl("", [Validators.required]),
    newEspecialidad: new FormControl("")
  });

  ngOnInit(): void
  {
    this.getEspecialidades();
    this.getObrasSociales();
  }

  async selectAvatar(event: any, avatarId: number)
  {
    try
    {
      var mimeType = event.target.files[0].type;
      if (mimeType.match(/image\/*/) != null)
      {
        switch (avatarId) {
          case 1:
            this.avatar1 = event.target.files[0];
            var reader = new FileReader();
            this.avatar1path = event.target.files;
            reader.readAsDataURL(event.target.files[0]); 
            reader.onload = (_event) =>
            { 
              this.avatar1URL = reader.result;
            }            
            break;

          case 2:
            this.avatar2 = event.target.files[0];
            var reader = new FileReader();
            this.avatar2path = event.target.files;
            reader.readAsDataURL(event.target.files[0]); 
            reader.onload = (_event) =>
            { 
              this.avatar2URL = reader.result;
            }            
            break;
        
          default:
            break;
        }

      }
    } catch (error) {
        if (error instanceof Error)
        {
          alert(error.message)
        }
    } finally {
      
    }
  }

  async uploadAvatar(avatarSelected: number)
  {
    try
    { 
      switch (avatarSelected) {
        case 1:
          const file1 = this.avatar1;
          const fileExt1 = this.avatar1?.name.split('.').pop();
          const name1= this.signupForm.get('email')?.value?.toLowerCase().split('@');
          const filePath1 = `${name1![0]}-1.${fileExt1}`;
          await this.supabaseService.uploadAvatar(filePath1, file1!);
          break;
      
        case 2:
          const file2 = this.avatar2;
          const fileExt2 = this.avatar2?.name.split('.').pop();
          const name2 = this.signupForm.get('email')?.value?.toLowerCase().split('@');
          const filePath = `${name2![0]}-2.${fileExt2}`;
          await this.supabaseService.uploadAvatar(filePath, file2!).then( ()=> {this.goToSuccessPage()} );
          break;
      }


    } catch (error) {
        if (error instanceof Error)
        {
          console.log(error.message);
        }
    } finally {
    }
  }

  protected addEspecialidad()
  {
    if (this.signupForm.get('newEspecialidad') != null && this.signupForm.get('newEspecialidad')!.value != "" )
    {
      var newEsp = this.signupForm.get('newEspecialidad')!.value?.toLowerCase();
      
      if(!this.especialidades.find((esp) => { return esp.nombre == newEsp}))
      {
        this.especialidades.push({id : -1, nombre: newEsp});
      }
      this.signupForm.get('newEspecialidad')?.reset();
    }
  }

  protected getEspecialidades(newRequest:boolean = false)
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
        this.lastEspecialidadesId = data[data.length - 1].id;
        
        if (newRequest)
        {
          this.insertNewEsp();
        } else {
          this.showSpinner = false;          
        }

      }
    })
  }

  protected getObrasSociales()
  {
    this.supabaseService.supabase.from('obras_sociales')
    .select('*')
    .then( ({data, error}) => 
    {
      if (error)
      {
        console.log(error.message);
        console.log(error.code);            
      } else {
        this.obrasSociales = data;
        this.showSpinner = false;
      }
    })
  }

  private async insertNewEsp()
  {
    for (let index1 = 0; index1 < this.signupForm.get('especialidad')!.value!.length; index1++)
    {
      if ((this.signupForm.get('especialidad')?.value![index1] as unknown as Especialidad).id == -1)
      {
        for (let index2 = 0; index2 < this.especialidades.length; index2++)
        {
          if ((this.signupForm.get('especialidad')?.value![index1] as unknown as Especialidad).nombre == this.especialidades[index2].nombre )
          {
            var {data,  error } = await this.supabaseService.supabase.from('users_especialidades').insert
            ({
              email_user: this.signupForm.get('email')?.value,
              id_especialidad: this.especialidades[index2].id
            })
          }
        }
      }
    }

    this.goToSuccessPage();
  }

  protected selectForm(mode:number)
  {
    switch (mode)
    {
      case 0:
        this.avatar2 = "";
        this.signupForm.controls.obraSocial.setValue("NON");
        this.signupForm.controls.obraSocial.removeValidators([Validators.required])
        this.signupForm.controls.obraSocial.updateValueAndValidity();
        break;

      case 1:
        this.avatar2 = "";
        this.signupForm.controls.obraSocial.setValue("NON");
        this.signupForm.controls.obraSocial.removeValidators([Validators.required])
        this.signupForm.controls.obraSocial.updateValueAndValidity();
        break;
        
      case 2:
        this.signupForm.controls.especialidad.removeValidators([Validators.required])
        this.signupForm.controls.obraSocial.updateValueAndValidity();
        break;
    }
        

    this.showForm = true;
    this.formMode = mode;
  }

  registrar()
  {
    this.errorUsuarioExiste = false;
    this.supabaseService.supabase.auth.signUp
    (
      {
        email: this.signupForm.get('email')!.value as string,
        password: this.signupForm.get('password')!.value as string
      }
    ).then(({error}) =>
      {
        switch(error?.code)
        {
          case 'user_already_exists':
            console.error('Error:', error.message);
            this.errorUsuarioExiste = true;
            break;
            
          default:
            console.error('Error:', error?.message, error?.code);
            break;
        }

        if (error == null)
        {
          this.insertUser();
          this.uploadAvatar(1);
          if (this.formMode == 1)
          {
            this.insertEspecialidades();  
          } else if (this.formMode == 2)
          {
            this.uploadAvatar(2);
          }
        } else {
          this.showSpinner = false;
        }
      }
    )
  }

  private async insertUser()
  {
    switch (this.formMode)
    {
      case 0:
        var {data,  error } = await this.supabaseService.supabase.from('users').insert
        ({
          firstname: this.signupForm.get('firstName')?.value,
          surname: this.signupForm.get('lastName')?.value,
          dni: this.signupForm.get('dni')?.value,
          age: this.signupForm.get('edad')?.value,
          role: 'administrador',
          email: this.signupForm.get('email')?.value,
          verification: true
        })
        break;

      case 1:
        var {data,  error } = await this.supabaseService.supabase.from('users').insert
        ({
          firstname: this.signupForm.get('firstName')?.value,
          surname: this.signupForm.get('lastName')?.value,
          dni: this.signupForm.get('dni')?.value,
          age: this.signupForm.get('edad')?.value,
          role: 'especialista',
          email: this.signupForm.get('email')?.value,
          obra_social: this.signupForm.get('obraSocial')?.value
        })
        break;
    
      case 2:
        var {data,  error } = await this.supabaseService.supabase.from('users').insert
        ({
          firstname: this.signupForm.get('firstName')?.value,
          surname: this.signupForm.get('lastName')?.value,
          dni: this.signupForm.get('dni')?.value,
          age: this.signupForm.get('edad')?.value,
          role: 'paciente',
          email: this.signupForm.get('email')?.value,
          obra_social: this.signupForm.get('obraSocial')?.value,
          verification: true
        })
        break;
    }
  }

  private async insertEspecialidades()
  {
    var newEsp: boolean = false;

    if (this.signupForm.get('especialidad')?.value != undefined)
    {
      for (let index = 0; index < this.signupForm.get('especialidad')!.value!.length; index++)
      {
        if ( (this.signupForm.get('especialidad')?.value![index] as unknown as Especialidad).id != -1)
        {
          var {data,  error } = await this.supabaseService.supabase.from('users_especialidades').insert
          ({
            email_user: this.signupForm.get('email')?.value,
            id_especialidad: (this.signupForm.get('especialidad')!.value![index] as unknown as Especialidad).id
          })
        } else {
          newEsp = true;
          var {data,  error } = await this.supabaseService.supabase.from('especialidades').insert
          ({
            nombre: (this.signupForm.get('especialidad')!.value![index] as unknown as Especialidad).nombre
          })
        }
      }
    }

    if (newEsp == true)
    {
      this.getEspecialidades(true)
    } else {
      this.goToSuccessPage();
    }

  }

  goToSuccessPage()
  {
    this.router.navigate(["cuenta-creada"])
  }

  onSubmit(): void
  {
    this.showSpinner = true;
    this.registrar();
    
  }
}
