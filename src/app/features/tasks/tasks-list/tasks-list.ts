import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { interval, startWith, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UsersList } from '../../users/users-list/users-list';

@Component({
  selector: 'app-tasks-list',
  imports: [CommonModule, ReactiveFormsModule, FormatEnumPipe],
  templateUrl: './tasks-list.html',
  styleUrl: './tasks-list.scss',
})
export class TasksList implements OnInit, OnDestroy {
  private readonly pollingFreq = environment.tasksPollingFrequency;
  private destroy$ = new Subject<void>();
  tasks: Task[] = [];
  users: Map<number, string> = new Map();
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

  constructor(private fb: FormBuilder, private readonly taskFacade: TasksFacade) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      status: [TaskStatus.TODO, Validators.required],
      priority: [TaskPriority.MEDIUM, Validators.required],
      dueDate: ['', Validators.required],
      assignedTo: [1, Validators.required],
    });
  }

  ngOnInit(): void {
    // Component owns the polling lifecycle - starts on init, stops on destroy
    interval(this.pollingFreq).pipe(
      startWith(0),
      switchMap(() => this.taskFacade.fetchAndEnrichTasks((tasks) => {
        this.tasks = tasks;
        this.users = this.taskFacade.users;
      })),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDeleteModal(id?: number): void {
    this.taskToDeleteId = id!;
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (this.taskToDeleteId !== null) {
      this.taskFacade.deleteTask(this.taskToDeleteId).subscribe(() => {
        this.tasks = this.tasks.filter((task) => task.id !== this.taskToDeleteId);
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
      const task = this.tasks.find((t) => t.id === id);
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
        const existingTask = this.tasks.find((t) => t.id === this.taskToEditId);
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
          this.taskFacade.updateTask(taskToUpdate).subscribe((updatedTask) => {
            if (updatedTask) {
              const taskIndex = this.tasks.findIndex((t) => t.id === this.taskToEditId);
              if (taskIndex !== -1) {
                this.tasks[taskIndex] = updatedTask;
              }
              this.closeTaskModal();
            }
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
        this.taskFacade.createTask(newTask).subscribe({
          next: (createdTask) => {
            if (createdTask) {
              this.tasks.push(createdTask);
              this.closeTaskModal();
            }
          }
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
