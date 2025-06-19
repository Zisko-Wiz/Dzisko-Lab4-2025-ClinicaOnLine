import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { SupaService } from '../../services/supa.service';


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
  ]
})
export class FormRegistroComponent
{
  private fb = inject(FormBuilder);
  private supabaseService = inject(SupaService);
  protected avatar1? : any;
  protected avatar1path? : any;
  protected avatar1URL : any;
  protected message?: string;


  signupForm = new FormGroup(
      {
        firstName: new FormControl("", [Validators.pattern(/^[\p{Letter}\p{Mark}]+$/u), Validators.required]),
        lastName: new FormControl("", [Validators.pattern(/^[\p{Letter}\p{Mark}]+$/u), Validators.required]),
        edad: new FormControl("", [Validators.pattern(/^\d+$/), Validators.min(18), Validators.max(99), Validators.required]),
        email: new FormControl("", [Validators.required, Validators.email]),
        password: new FormControl("", [Validators.required, Validators.minLength(5)]),
        dni: new FormControl("", [Validators.required, Validators.pattern(/^\d+$/)]),
        obraSocial: new FormControl("", [Validators.required])
      }
    )  ;

  hasUnitNumber = false;

  obrasSociales =
  [
    {name: 'Instituto de Obra Médico Asistencial', abbreviation: 'IOMA'},
    {name: 'Unión del Personal Civil de la Nación', abbreviation: 'UPCN'},
    {name: 'Obra Social de los Empleados de Comercio y Actividades Civiles', abbreviation: 'OSECAC'}    
  ];

  async selectAvatar(event: any)
  {
    try
    {
      var mimeType = event.target.files[0].type;
      if (mimeType.match(/image\/*/) != null)
      {
        this.avatar1 = event.target.files[0];
        var reader = new FileReader();
        this.avatar1path = event.target.files;
        reader.readAsDataURL(event.target.files[0]); 
        reader.onload = (_event) =>
        { 
          this.avatar1URL = reader.result;
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

      console.log(filePath);
      

      await this.supabaseService.uploadAvatar(filePath, file!);

    } catch (error) {
        if (error instanceof Error)
        {
          alert(error.message)
        }
    } finally {
    }
  }


  onSubmit(): void
  {
    alert('Thanks!');
  }
}
