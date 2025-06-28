import { Component, inject } from '@angular/core';
import { Header } from '../header/header';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { SigninService } from '../../services/signin.service';

@Component({
  selector: 'app-perfil',
  imports: [
    Header,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil
{
  protected signInService = inject(SigninService);
  protected horarios?: any[];
}
