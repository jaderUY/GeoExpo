import { Routes } from '@angular/router';

export const routes: Routes = [
  // 1. Redirección raíz → tab de mapa
  {
    path: '',
    redirectTo: 'tabs/mapa',
    pathMatch: 'full',
  },

  // 2. Contenedor de tabs (LAZY — sin `component`, solo `loadComponent`)
  {
    path: 'tabs',
    loadComponent: () =>
      import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'mapa',
        pathMatch: 'full',
      },
      {
        path: 'mapa',
        loadComponent: () =>
          import('./features/mapa/mapa.page').then((m) => m.MapaPage),
      },
      {
        path: 'guardados',
        loadComponent: () =>
          import('./features/guardados/guardados.page').then((m) => m.GuardadosPage),
      },
      {
        path: 'anadir',
        loadComponent: () =>
          import('./features/anadir/anadir.page').then((m) => m.AnadirPage),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/perfil.page').then((m) => m.PerfilPage),
      },
    ],
  },

  // 3. Aliases de conveniencia
  { path: 'mapa',      redirectTo: 'tabs/mapa',      pathMatch: 'full' },
  { path: 'guardados', redirectTo: 'tabs/guardados', pathMatch: 'full' },
  { path: 'anadir',    redirectTo: 'tabs/anadir',    pathMatch: 'full' },
  { path: 'perfil',    redirectTo: 'tabs/perfil',    pathMatch: 'full' },

  // 4. Wildcard
  { path: '**', redirectTo: 'tabs/mapa' },
];