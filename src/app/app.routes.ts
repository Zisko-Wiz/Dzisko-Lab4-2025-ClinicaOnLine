import { Routes } from '@angular/router';
import { canMatchUsersGuard } from './guards/can-match-users-guard';
import { canMatchPerfilGuard } from './guards/can-match-perfil-guard';

export const routes: Routes = [
    
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
    },
    {
        path: 'home',
        loadComponent: () => import('./components/home/home').then(c => c.Home)
    },
    {
        path: 'registro',
        loadComponent: () => import('./components/form-registro/form-registro.component').then(c => c.FormRegistroComponent)
    },
    {
        path: 'ingreso',
        loadComponent: () => import('./components/login/login').then(c => c.Login)
    },
    {
        path: 'cuenta-creada',
        loadComponent: () => import('./components/signup-success/signup-success').then(c => c.SignupSuccess)
    },
    {
        path: 'usuarios',
        loadComponent: () => import('./components/users/users.component').then(c => c.UsersComponent),
        canMatch: [canMatchUsersGuard]
    },
    {
        path: 'mi-perfil',
        loadComponent: () => import('./components/perfil/perfil').then(c => c.Perfil),
        canMatch: [canMatchPerfilGuard]
    },
    {
        path: 'turnos',
        loadComponent: () => import('./components/menu-turnos/menu-turnos').then(c => c.MenuTurnos)
    },
    {
        path: 'solicitar-turno',
        loadComponent: () => import('./components/turnos/turnos').then(c => c.Turnos)
    },
    {
        path: '**',
        loadComponent: () => import('./components/error-page/error-page').then(c => c.ErrorPage)
    }
];
