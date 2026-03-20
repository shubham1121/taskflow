import { inject, Injectable, OnDestroy } from "@angular/core";
import { UsersApiService } from "../api/users-api-service";
import { environment } from "../../../../environments/environment";
import { BehaviorSubject, interval, Observable, startWith, Subject, switchMap, takeUntil, throwError } from "rxjs";
import { UserModel } from "../models/users-model";
import { TasksApiService } from "../../tasks/api/tasks-api-service";

@Injectable({
  providedIn: 'root'
})
export class UsersFacade implements OnDestroy {
    private readonly tasksService = inject(TasksApiService);
    private readonly userPollingFreq = environment.userPollingFrequency;
    allUsersPolling = new BehaviorSubject<UserModel[]>([]);
    allUsers$ = this.allUsersPolling.asObservable();
    private destroy$ = new Subject<void>();
    constructor(private readonly usersApiService: UsersApiService) {
        this.initializePolling();
    }

    private initializePolling() : void {
        interval(this.userPollingFreq).pipe(
            startWith(0),
            switchMap(() => this.usersApiService.getAllUsers()),
            takeUntil(this.destroy$)
        ).subscribe(users => {
            this.allUsersPolling.next(users);
        });
    }

    getUserById(id: number) {
        return this.usersApiService.getUserById(id);
    }

    createUser(user: UserModel) {
        return this.usersApiService.createUser(user);
    }

    deleteUser(id: number): Observable<void> {
        return this.tasksService.getAllTasksByUserId(id).pipe(
            switchMap((tasks) => {
                if (tasks.length > 0) {
                    return throwError(() => new Error('Cannot delete user with assigned tasks'));
                }
                return this.usersApiService.deleteUser(id);
            })
        );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}