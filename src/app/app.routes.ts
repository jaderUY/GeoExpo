import { Routes } from '@angular/router';
import { TabsPage } from './features/tabs/tabs.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/mapa',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: 'mapa',
        pathMatch: 'full',
      },
      {
        path: 'mapa',
        loadComponent: () => import('./features/mapa/mapa.page').then((m) => m.MapaPage),
      },
      {
        path: 'guardados',
        loadComponent: () => import('./features/guardados/guardados.page').then((m) => m.GuardadosPage),
      },
      {
        path: 'anadir',
        loadComponent: () => import('./features/anadir/anadir.page').then((m) => m.AnadirPage),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil.page').then((m) => m.PerfilPage),
      },
    ],
  },
  {
    path: 'mapa',
    redirectTo: 'tabs/mapa',
    pathMatch: 'full',
  },
  {
    path: 'guardados',
    redirectTo: 'tabs/guardados',
    pathMatch: 'full',
  },
  {
    path: 'anadir',
    redirectTo: 'tabs/anadir',
    pathMatch: 'full',
  },
  {
    path: 'perfil',
    redirectTo: 'tabs/perfil',
    pathMatch: 'full',
  },
];
