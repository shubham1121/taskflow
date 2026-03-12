import { Injectable } from "@angular/core";
import { Task } from "../models/task.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class TasksApiService {
    constructor(private readonly http: HttpClient) {}

    getAllTasks() : Observable<Task[]> {
        return this.http.get<Task[]>("/api/tasks");
    }

    createTask(task: Omit<Task, "id">) : Observable<Task> {
        return this.http.post<Task>("/api/tasks", task);
    }

    deleteTask(taskId: string) : Observable<void> {
        return this.http.delete<void>(`/api/tasks/${taskId}`);
    }

}