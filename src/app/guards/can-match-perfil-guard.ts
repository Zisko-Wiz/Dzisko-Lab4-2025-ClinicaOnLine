import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { SigninService } from '../services/signin.service';

export const canMatchPerfilGuard: CanMatchFn = (route, segments) =>
{
  let signIn = inject(SigninService);
  return signIn.getUsuario().then( () => {
    if (signIn.usuario != undefined)
    {
      return true;
    } else {
      return false;
    }
  })
};
