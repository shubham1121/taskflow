import { inject, Injectable } from "@angular/core";
import { TasksApiService } from "../../tasks/api/tasks-api-service";

@Injectable({
    providedIn: "root",
})
export class DashboardFacade {
    private readonly tasksApiService = inject(TasksApiService);
    getTaskStatusCount() {
        return this.tasksApiService.getTaskStatusCount();
    }

    getTaskPriorityCount() {
        return this.tasksApiService.getTaskPriorityCount();
    }
}