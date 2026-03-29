import { inject, Injectable } from "@angular/core";
import { TasksApiService } from "../../tasks/api/tasks-api-service";
import { toSignal } from "@angular/core/rxjs-interop";
import { TaskPriority, TaskStatus } from "../../tasks/models/task.model";

@Injectable({
    providedIn: "root",
})
export class DashboardFacade {
    private readonly tasksApiService = inject(TasksApiService);

    statusSignal = toSignal(this.tasksApiService.getTaskStatusCount(), {
        initialValue: {
            [TaskStatus.TODO]: 0,
            [TaskStatus.IN_PROGRESS]: 0,
            [TaskStatus.DONE]: 0
        } as Record<TaskStatus, number>
    });

    prioritySignal = toSignal(this.tasksApiService.getTaskPriorityCount(), {
        initialValue: {
            [TaskPriority.LOW]: 0,
            [TaskPriority.MEDIUM]: 0,
            [TaskPriority.HIGH]: 0
        } as Record<TaskPriority, number>
    });
}