import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { SigninService } from '../services/signin.service';

export const canMatchUsersGuard: CanMatchFn = (route, segments) => {

  let signIn = inject(SigninService);
  let router = inject(Router);
  signIn.getRole();

  switch (signIn.userRole)
  {
    case 'administrador':
      return true;

    case 'especialista':
     router.navigate(['/mis-turnos/especialista']);
     break

    case 'paciente':
      router.navigate(['/mis-turnos/paciente']);
      break
  }

  return false;
};
