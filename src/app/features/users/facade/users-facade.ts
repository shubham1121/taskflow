import { Injectable, OnDestroy } from "@angular/core";
import { UsersApiService } from "../api/users-api-service";
import { environment } from "../../../../environments/environment";
import { BehaviorSubject, interval, startWith, Subject, switchMap, takeUntil } from "rxjs";
import { UserModel } from "../models/users-model";

@Injectable({
  providedIn: 'root'
})
export class UsersFacade implements OnDestroy {
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

    deleteUser(id: number) {
        return this.usersApiService.deleteUser(id);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}