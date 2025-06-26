import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, Validators, FormGroup, FormControl, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { SupaService } from '../../services/supa.service';
import { RouterLink } from '@angular/router';


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
    FormsModule
  ]
})
export class FormRegistroComponent implements OnInit
{
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

  signupForm = new FormGroup(
  {
    firstName: new FormControl("", [Validators.pattern(/^[\p{Letter}\p{Mark}]+$/u), Validators.required]),
    lastName: new FormControl("", [Validators.pattern(/^[\p{Letter}\p{Mark}]+$/u), Validators.required]),
    edad: new FormControl("", [Validators.pattern(/^\d+$/), Validators.min(18), Validators.max(99), Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(5)]),
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

  async uploadAvatar()
  {
    try
    { 
      const file = this.avatar1;
      const fileExt = this.avatar1?.name.split('.').pop();
      const filePath = `luisAcuna.${fileExt}`;

      await this.supabaseService.uploadAvatar(filePath, file!);

    } catch (error) {
        if (error instanceof Error)
        {
          alert(error.message)
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

  protected getEspecialidades()
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
        }
      })
  }

  protected selectForm(mode:number)
  {
    switch (mode)
    {
      case 1:
        this.avatar2 = "";
        this.signupForm.controls.obraSocial.setValue("Ninguna");
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

  onSubmit(): void
  {
    console.log(this.signupForm.value);
  }
}
