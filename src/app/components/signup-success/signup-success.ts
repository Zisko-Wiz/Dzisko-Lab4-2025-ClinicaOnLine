import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup-success',
  imports: [
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './signup-success.html',
  styleUrl: './signup-success.scss'
})
export class SignupSuccess {

}
