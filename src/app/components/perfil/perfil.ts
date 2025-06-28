import { Component, inject, OnInit } from '@angular/core';
import { Header } from '../header/header';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { SigninService } from '../../services/signin.service';
import { SupaService } from '../../services/supa.service';

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
export class Perfil implements OnInit
{
  protected signInService = inject(SigninService);
  protected supabaseService = inject(SupaService);

  ngOnInit(): void
  {
  }
}
