import { inject, Injectable } from "@angular/core";
import { Task } from "../models/task.model";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, catchError, interval, Observable, throwError } from "rxjs";
import { ApiErrorHandlerService } from "../../../core/api-error-handler-service";
import { environment } from "../../../../environments/environment";
import { insertImport } from "@angular/cdk/schematics";

@Injectable({
    providedIn: "root",
})
export class TasksApiService {
    private readonly apiErrorHandler = inject(ApiErrorHandlerService);
    private readonly API_URL = `${environment.apiBaseUrl}/tasks`;

    constructor(private readonly http: HttpClient) {}

    getAllTasks() : Observable<Task[]> {
        return this.http.get<Task[]>(this.API_URL).pipe(
            catchError(error => this.handleError(error))
        );
    }

    createTask(task: Omit<Task, "id">) : Observable<Task> {
        return this.http.post<Task>(this.API_URL, task).pipe(
            catchError(error => this.handleError(error))
        );
    }

    updateTask(taskId: string, updatedTask: Task) : Observable<Task> {
        return this.http.put<Task>(`${this.API_URL}/${taskId}`, updatedTask).pipe(
            catchError(error => this.handleError(error))
        );
    }

    deleteTask(taskId: string) : Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${taskId}`).pipe(
            catchError(error => this.handleError(error))
        );
    }

    private handleError(error: any): Observable<never> {
            console.error('API Error:', error);
            this.apiErrorHandler.handleError(error);
            return throwError(() => error);
    }

}