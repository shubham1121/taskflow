import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import {
  catchError,
  exhaustMap,
  from,
  interval,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  scan,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { Task } from '../models/task.model';
import { TasksApiService } from '../api/tasks-api-service';
import { UsersApiService } from '../../users/api/users-api-service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TasksFacade implements OnDestroy {
  private readonly pollingFreq = environment.tasksPollingFrequency;
  private destroy$ = new Subject<void>();
  private refresh$ = new Subject<void>();
  private readonly tasksApiService = inject(TasksApiService);
  private readonly usersApiService = inject(UsersApiService);
  private userIdCache = new Map<number,  string>();

  allTasksSignal = signal<Task[]>([]);

  constructor() {
    this.initializePollingTasks();
  }

  get users() : Map<number, string> {
    return this.userIdCache;
  }

  initializePollingTasks(): void {
    const polling$ = interval(this.pollingFreq).pipe(
      startWith(0),
    );
    merge(polling$, this.refresh$).pipe(
      exhaustMap(() => this.fetchAndEnrichTasks()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  createTask(task: Task): Observable<Task> {
    return this.tasksApiService.createTask(task).pipe(
      map((createdTask) => {
        createdTask.assignedUserName = this.userIdCache.get(createdTask.assignedTo) || 'Unassigned';
        return createdTask;
      }),
      tap(() => {
        this.refresh$.next();
      }),
      catchError((error) => {
        console.error('Error creating task:', error);
        return of(null as unknown as Task);
      }),
    );
  }

  deleteTask(taskId: number): Observable<void> {
    return this.tasksApiService.deleteTask(taskId).pipe(
      tap(() => {
        this.refresh$.next();
      }),
      catchError((error) => {
        console.error('Error deleting task:', error);
        return of(undefined);
      })
    );
  }

  updateTask(task: Task): Observable<Task> {
    return this.tasksApiService.updateTask(task).pipe(
      map((updatedTask) => {
        updatedTask.assignedUserName = this.userIdCache.get(updatedTask.assignedTo) || 'Unassigned';
        return updatedTask;
      }),
      tap(() => {
        this.refresh$.next();
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
  fetchAndEnrichTasks(): Observable<Task[]> {
    return this.tasksApiService.getAllTasks().pipe(
      switchMap((tasks) => {
        // Emit tasks with assignedTo as default name immediately
        this.allTasksSignal.set(tasks);
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
          tap((updatedTasks) => this.allTasksSignal.set(updatedTasks)),
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
