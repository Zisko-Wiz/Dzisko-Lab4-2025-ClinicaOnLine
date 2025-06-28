import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { SigninService } from '../services/signin.service';

export const canMatchUsersGuard: CanMatchFn = (route, segments) => {

  let signIn = inject(SigninService);
  signIn.getRole();

  if (signIn.userRole == 'administrador')
  {
    return true;
  }
  return false;
};
