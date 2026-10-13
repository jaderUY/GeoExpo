import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./features/tabs/tabs.page').then((m) => m.TabsPage),
  },
  {
    path: '',
    redirectTo: 'tabs/mapa',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadComponent: () => import('./features/tabs/tabs.page').then( m => m.TabsPage)
  },
  {
    path: 'mapa',
    loadComponent: () => import('./features/mapa/mapa.page').then( m => m.MapaPage)
  },
  {
    path: 'guardados',
    loadComponent: () => import('./features/guardados/guardados.page').then( m => m.GuardadosPage)
  },
  {
    path: 'anadir',
    loadComponent: () => import('./features/anadir/anadir.page').then( m => m.AnadirPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/perfil/perfil.page').then( m => m.PerfilPage)
  },
];
