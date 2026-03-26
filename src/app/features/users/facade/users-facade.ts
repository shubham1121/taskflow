import { inject, Injectable, OnDestroy, signal } from "@angular/core";
import { UsersApiService } from "../api/users-api-service";
import { environment } from "../../../../environments/environment";
import { interval, merge, Observable, startWith, Subject, switchMap, takeUntil, tap, throwError } from "rxjs";
import { UserModel } from "../models/users-model";
import { TasksApiService } from "../../tasks/api/tasks-api-service";

@Injectable({
  providedIn: 'root'
})
export class UsersFacade implements OnDestroy {
    private readonly tasksService = inject(TasksApiService);
    private readonly userPollingFreq = environment.userPollingFrequency;
    allUsers = signal<UserModel[]>([]);
    private destroy$ = new Subject<void>();
    private refresh$ = new Subject<void>();
    constructor(private readonly usersApiService: UsersApiService) {
        this.initializePolling();
    }

    private initializePolling() : void {
        const polling$ = interval(this.userPollingFreq).pipe(
            startWith(0)
        );
        merge(polling$, this.refresh$).pipe(
            switchMap(() => this.usersApiService.getAllUsers()),
            takeUntil(this.destroy$)
        ).subscribe(users => {
            this.allUsers.set(users);
        });
    }

    getUserById(id: number) : Observable<UserModel> {
        return this.usersApiService.getUserById(id);
    }

    createUser(user: UserModel) : Observable<UserModel> {
        return this.usersApiService.createUser(user).pipe(
            tap(() => {
                this.refresh$.next();
            })
        );
    }

    deleteUser(id: number): Observable<void> {
        return this.tasksService.getAllTasksByUserId(id).pipe(
            switchMap((tasks) => {
                if (tasks.length > 0) {
                    return throwError(() => new Error('Cannot delete user with assigned tasks'));
                }
                return this.usersApiService.deleteUser(id).pipe(
                    tap(() => {
                        this.refresh$.next();
                    })
                );
            })
        );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}