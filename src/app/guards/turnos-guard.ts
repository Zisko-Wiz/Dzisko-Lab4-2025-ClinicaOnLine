import { CanActivateFn, Router } from '@angular/router';
import { SigninService } from '../services/signin.service';
import { inject } from '@angular/core';

export const turnosGuard: CanActivateFn = (route, state) => {
    let signIn = inject(SigninService);
    let router = inject(Router);
    signIn.getRole();

    switch (signIn.userRole)
    {
      case 'especialista':
        router.navigate(['/mis-turnos/especialista']);
        break
    }

    return true;
};
