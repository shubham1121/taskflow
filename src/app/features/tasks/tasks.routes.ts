import { Router, Routes } from "@angular/router";
import { TasksList } from "./tasks-list/tasks-list";

export const TASKS_ROUTES : Routes = [
    {
    path: '',
    component: TasksList
  },
//   {
//     path: 'new',
//     loadComponent: () =>
//       import('./task-create/task-create.component')
//         .then(c => c.TaskCreateComponent)
//   },
//   {
//     path: ':id',
//     loadComponent: () =>
//       import('./task-detail/task-detail.component')
//         .then(c => c.TaskDetailComponent)
//   }
];