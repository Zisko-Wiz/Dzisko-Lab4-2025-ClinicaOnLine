import { Routes } from '@angular/router';
import { canMatchUsersGuard } from './guards/can-match-users-guard';
import { canMatchPerfilGuard } from './guards/can-match-perfil-guard';
import { turnosGuard } from './guards/turnos-guard';

export const routes: Routes = [
    
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
    },
    {
        path: 'home',
        loadComponent: () => import('./components/home/home').then(c => c.Home),
    },
    {
        path: 'registro',
        loadComponent: () => import('./components/form-registro/form-registro.component').then(c => c.FormRegistroComponent),
        
    },
    {
        path: 'ingreso',
        loadComponent: () => import('./components/login/login').then(c => c.Login),
    },
    {
        path: 'cuenta-creada',
        loadComponent: () => import('./components/signup-success/signup-success').then(c => c.SignupSuccess),
        data: {animation: 'slideInAnimation'}
    },
    {
        path: 'usuarios',
        loadComponent: () => import('./components/users/users.component').then(c => c.UsersComponent),
        canMatch: [canMatchUsersGuard],
    },
    {
        path: 'mi-perfil',
        loadComponent: () => import('./components/perfil/perfil').then(c => c.Perfil),
        canMatch: [canMatchPerfilGuard],
    },
    {
        path: 'turnos',
        loadComponent: () => import('./components/menu-turnos/menu-turnos').then(c => c.MenuTurnos),
        data: {animation: 'slideInAnimation'},
        canActivate: [turnosGuard]
    },
    {
        path: 'solicitar-turno',
        loadComponent: () => import('./components/turnos/turnos').then(c => c.Turnos),
    },
    {
        path: 'todos-turnos',
        loadComponent: () => import('./components/todos-turnos/todos-turnos').then(c => c.TodosTurnos),
        canMatch: [canMatchUsersGuard],
    },
    {
        path: 'mis-turnos/especialista',
        loadComponent: () => import('./components/mis-turnos/mis-turnos').then(c => c.MisTurnos),
        canMatch: [canMatchPerfilGuard],
    },
    {
        path: 'mis-turnos/paciente',
        loadComponent: () => import('./components/turnos-paciente/turnos-paciente').then(c => c.TurnosPaciente),
    },
    {
        path: 'pacientes',
        loadComponent: () => import('./components/pacientes/pacientes').then(c => c.Pacientes)
    },
    {
        path: 'historial-clinico',
        loadComponent: () => import('./components/historia/historia').then( c => c.HistoriaComponent)
    },
    {
        path: 'estadisticas',
        loadComponent: () => import('./components/stats/stats').then(c => c.Stats)
    },
    {
        path: '**',
        loadComponent: () => import('./components/error-page/error-page').then(c => c.ErrorPage),
    }
];
