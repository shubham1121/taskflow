import { inject, Injectable } from '@angular/core';
import {
  catchError,
  from,
  map,
  mergeMap,
  Observable,
  of,
  scan,
  switchMap,
  tap,
} from 'rxjs';
import { Task } from '../models/task.model';
import { TasksApiService } from '../api/tasks-api-service';
import { UsersApiService } from '../../users/api/users-api-service';

@Injectable({
  providedIn: 'root',
})
export class TasksFacade {
  private readonly tasksApiService = inject(TasksApiService);
  private readonly usersApiService = inject(UsersApiService);
  private userIdCache = new Map<number,  string>();

  get users() : Map<number, string> {
    return this.userIdCache;
  }

  createTask(task: Task): Observable<Task> {
    return this.tasksApiService.createTask(task).pipe(
      map((createdTask) => {
        createdTask.assignedUserName = this.userIdCache.get(createdTask.assignedTo) || 'Unassigned';
        return createdTask;
      }),
      catchError((error) => {
        console.error('Error creating task:', error);
        return of(null as unknown as Task);
      }),
    );
  }

  deleteTask(taskId: number): Observable<void> {
    return this.tasksApiService.deleteTask(taskId).pipe(
      catchError((error) => {
        console.error('Error deleting task:', error);
        return of(undefined);
      }
    ));
  }

  updateTask(task: Task): Observable<Task> {
    return this.tasksApiService.updateTask(task).pipe(
      map((updatedTask) => {
        updatedTask.assignedUserName = this.userIdCache.get(updatedTask.assignedTo) || 'Unassigned';
        return updatedTask;
      }),
      catchError((error) => {
        console.error('Error updating task:', error);
        return of(null as unknown as Task);
      }),
    );
  }

  /**
   * Fetches all tasks and enriches them with user names.
   * Emits tasks immediately with default names, then updates as user names arrive.
   * The component is responsible for calling this and managing the subscription lifecycle.
   */
  fetchAndEnrichTasks(onUpdate: (tasks: Task[]) => void): Observable<Task[]> {
    return this.tasksApiService.getAllTasks().pipe(
      switchMap((tasks) => {
        // Emit tasks with assignedTo as default name immediately
        onUpdate(tasks);
        // Then enrich user names in background
        return from(tasks).pipe(
          mergeMap(
            (task) => this.enrichUserName(task),
            10, // Concurrency limit
          ),
          scan(
            (accumulator: Task[], enrichedTask: Task) => {
              const existingIndex = accumulator.findIndex(
                (t) => t.id === enrichedTask.id,
              );
              if (existingIndex > -1) {
                accumulator[existingIndex] = enrichedTask;
              } else {
                accumulator.push(enrichedTask);
              }
              return [...accumulator];
            },
            tasks,
          ),
          tap((updatedTasks) => onUpdate(updatedTasks)),
        );
      }),
    );
  }

  private enrichUserName(task: Task): Observable<Task> {
    const cachedName = this.userIdCache.get(task.assignedTo);
    if (cachedName) {
      return of({ ...task, assignedUserName: cachedName });
    }
    return this.usersApiService.getUserById(task.assignedTo).pipe(
      map((user) => {
        this.userIdCache.set(task.assignedTo, user.name);
        return { ...task, assignedUserName: user.name };
      }),
      catchError(() => of({ ...task, assignedUserName: 'Unassigned' })),
    );
  }
}
