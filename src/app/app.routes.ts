import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/simulator/simulator/simulator').then(m => m.SimulatorComponent)
  }
];
