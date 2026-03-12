import { Routes } from '@angular/router';
import { AppShell } from './layout/app-shell/app-shell';

export const routes: Routes = [
    {
        path: '',
        component: AppShell,
        children:[
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => {
                    return import('./features/dashboard/dashboard').
                        then(c => c.Dashboard);
                }
            },
            {
                path: 'tasks',
                loadChildren: () => {
                    return import('./features/tasks/tasks.routes').
                        then(m => m.TASKS_ROUTES);
                }
            }
        ]
    }
];
