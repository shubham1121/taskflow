import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { UserModel } from "../models/users-model";
import { ApiErrorHandlerService } from "../../../core/api-error-handler-service";
import { environment } from "../../../../environments/environment";

@Injectable({
    providedIn: "root"
})
export class UsersApiService {
    private readonly baseUrl = environment.apiBaseUrl;
    private readonly API_URL = `${this.baseUrl}/users`;

    constructor(private readonly http: HttpClient, private readonly apiErrorHandlerService: ApiErrorHandlerService) {}

    getAllUsers(): Observable<UserModel[]> {
        return this.http.get<UserModel[]>(this.API_URL).pipe(
            catchError(error => this.handleError(error))
        );
    }

    getUserById(id: number): Observable<UserModel> {
        return this.http.get<UserModel>(`${this.API_URL}/${id}`).pipe(
            catchError(error => this.handleError(error))
        );
    }

    createUser(user: UserModel): Observable<UserModel> {
        return this.http.post<UserModel>(this.API_URL, user).pipe(
            catchError(error => this.handleError(error))
        );
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
            catchError(error => this.handleError(error))
        );
    }

    updateUser(id: number, user: UserModel): Observable<UserModel> {
        return this.http.put<UserModel>(`${this.API_URL}/${id}`, user).pipe(
            catchError(error => this.handleError(error))
        );
    }

    private handleError(error: any): Observable<never> {
        console.error('API Error:', error);
        this.apiErrorHandlerService.handleError(error);
        return throwError(() => error);
    }
}