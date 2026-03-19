import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  from,
  interval,
  map,
  mergeMap,
  of,
  scan,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../../../environments/environment.prod';
import { TasksApiService } from '../api/tasks-api-service';
import { UsersFacade } from '../../users/facade/users-facade';

@Injectable({
  providedIn: 'root',
})
export class TasksFacade implements OnDestroy {
  private readonly taskPolling = environment.tasksPollingFrequency;
  private readonly tasksApiService = inject(TasksApiService);
  private readonly usersFacade = inject(UsersFacade);
  getAllTasksSubject = new BehaviorSubject<Task[]>([]);
  getAllTasks$ = this.getAllTasksSubject.asObservable();
  destroy$ = new Subject<void>();
  private userIdCache = new Map<number, string>();

  constructor() {
    this.initializePolling();
  }

  private initializePolling() {
    interval(this.taskPolling)
      .pipe(
        startWith(0),
        switchMap(() => this.tasksApiService.getAllTasks()),
        switchMap((tasks) => {
          // Emit tasks with default names immediately
          return of(tasks).pipe(
            tap((defaultTasks) =>
              this.getAllTasksSubject.next(defaultTasks),
            ),
            // Then enrich user names in background
            switchMap(() =>
              from(tasks).pipe(
                mergeMap(
                  (task) => this.enrichUserName(task),
                  10, // Concurrency limit
                ),
                // Update each task as user name arrives
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
                tap((updatedTasks) =>
                  this.getAllTasksSubject.next(updatedTasks),
                ),
              ),
            ),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private enrichUserName(task: Task) {
    const cachedName = this.userIdCache.get(task.assignedTo);
    if (cachedName) {
      return of({ ...task, assignedUserName: cachedName });
    }
    return this.usersFacade.getUserById(task.assignedTo).pipe(
      map((user) => {
        this.userIdCache.set(task.assignedTo, user.name);
        return { ...task, assignedUserName: user.name };
      }),
      catchError(() => {
        return of({
          ...task,
          assignedUserName: `User ${task.assignedTo}`,
        });
      }),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.userIdCache.clear();
  }
}
