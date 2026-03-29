import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Task, TaskStatus, TaskPriority } from '../models/task.model';
import { TasksFacade } from '../facade/tasks.facade';
import { FormatEnumPipe } from '../../../shared/pipes/format-enum.pipe';
import { UsersFacade } from '../../users/facade/users-facade';

@Component({
  selector: 'app-tasks-list',
  imports: [CommonModule, ReactiveFormsModule, FormatEnumPipe],
  templateUrl: './tasks-list.html',
  styleUrl: './tasks-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksList {
  private readonly taskFacade = inject(TasksFacade);
  private readonly userFacade = inject(UsersFacade);
  allTasksComputed = computed(() => this.taskFacade.allTasksSignal());
  users = computed(() => this.userFacade.allUsers());
  isDeleteModalOpen = false;
  taskToDeleteId: number | null = null;
  taskToEditId: number | null = null;
  isTaskModalOpen = false;
  taskForm: FormGroup;
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  statusBadgeColor: { [key in TaskStatus]: string } = {
    [TaskStatus.TODO]: 'secondary',
    [TaskStatus.IN_PROGRESS]: 'warning',
    [TaskStatus.DONE]: 'success',
  };
  priorityBadgeColor: { [key in TaskPriority]: string } = {
    [TaskPriority.LOW]: 'info',
    [TaskPriority.MEDIUM]: 'warning',
    [TaskPriority.HIGH]: 'danger',
  };

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      status: [TaskStatus.TODO, Validators.required],
      priority: [TaskPriority.MEDIUM, Validators.required],
      dueDate: ['', Validators.required],
      assignedTo: [1, Validators.required],
    });
  }

  openDeleteModal(id?: number): void {
    this.taskToDeleteId = id!;
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (this.taskToDeleteId !== null) {
      this.taskFacade.deleteTask(this.taskToDeleteId).subscribe(() => {
        this.closeDeleteModal();
      });
    } else {
      console.error('No task ID specified for deletion.');
      this.closeDeleteModal();
    }
  }

  cancelDelete(): void {
    this.closeDeleteModal();
  }

  private closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.taskToDeleteId = null;
  }

  openTaskModal(id?: number): void {
    this.isTaskModalOpen = true;
    if (id) {
      this.taskToEditId = id;
      const task = this.allTasksComputed().find((t) => t.id === id);
      this.taskForm.setValue({
        title: task!.title,
        description: task!.description,
        status: task!.status,
        priority: task!.priority,
        dueDate: task!.dueDate,
        assignedTo: task!.assignedTo,
      });
      return;
    }
    this.taskForm.reset({
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      assignedTo: 1,
    });
  }

  cancelTask(): void {
    this.closeTaskModal();
  }

  submitTask(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      if (this.taskToEditId) {
        const existingTask = this.allTasksComputed().find((t) => t.id === this.taskToEditId);
        const taskToUpdate: Task = {
          id: this.taskToEditId,
          title: formValue.title,
          description: formValue.description,
          status: formValue.status,
          priority: formValue.priority,
          dueDate: formValue.dueDate,
          createdAt: existingTask?.createdAt || new Date().toISOString().split('T')[0],
          assignedTo: Number(formValue.assignedTo),
        };
        if (existingTask) {
          this.taskFacade.updateTask(taskToUpdate).subscribe(() => {
              this.closeTaskModal();
          });
        }
      } else {
        const newTask: Task = {
          title: formValue.title,
          description: formValue.description,
          status: formValue.status,
          priority: formValue.priority,
          dueDate: formValue.dueDate,
          createdAt: new Date().toISOString().split('T')[0],
          assignedTo: Number(formValue.assignedTo),
        };
        this.taskFacade.createTask(newTask).subscribe(() => {
          this.closeTaskModal();
        });
      }
    }
  }

  private closeTaskModal(): void {
    this.isTaskModalOpen = false;
    this.taskForm.reset({
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assignedTo: 1,
    });
  }
}
