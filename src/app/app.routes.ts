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
                loadComponent: () => {
                    return import('./features/tasks/tasks-list/tasks-list').
                        then(c => c.TasksList);
                }
            },
            {
                path: 'users',
                loadComponent: () => {
                    return import('./features/users/users-list/users-list').
                        then(c => c.UsersList);
                }
            }
        ]
    }
];
