import { Routes } from '@angular/router';

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
    }
];
