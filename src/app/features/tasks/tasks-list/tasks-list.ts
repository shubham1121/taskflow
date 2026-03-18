import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Task, TaskStatus, TaskPriority } from '../models/task.model';

@Component({
  selector: 'app-tasks-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tasks-list.html',
  styleUrl: './tasks-list.scss',
})
export class TasksList implements OnInit {
  tasks: Task[] = [];
  isDeleteModalOpen = false;
  taskToDeleteId: number | null = null;
  taskToEditId: number | null = null;
  isTaskModalOpen = false;
  taskForm: FormGroup;
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  statusBadgeColor: { [key in TaskStatus]: string } = {
    [TaskStatus.Todo]: 'secondary',
    [TaskStatus.InProgress]: 'warning',
    [TaskStatus.Done]: 'success',
  };
  priorityBadgeColor: { [key in TaskPriority]: string } = {
    [TaskPriority.Low]: 'info',
    [TaskPriority.Medium]: 'warning',
    [TaskPriority.High]: 'danger',
  };

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      status: [TaskStatus.Todo, Validators.required],
      priority: [TaskPriority.Medium, Validators.required],
      dueDate: ['', Validators.required],
      assignedTo: [1, Validators.required],
    });
  }

  ngOnInit(): void {
    this.tasks = [
      {
        id: 1,
        title: 'Design Dashboard',
        description: 'Create UI mockups for the main dashboard',
        status: TaskStatus.Done,
        priority: TaskPriority.High,
        dueDate: '2026-03-10',
        createdAt: '2026-02-15',
        assignedTo: 1,
      },
      {
        id: 2,
        title: 'Setup Database',
        description: 'Configure MongoDB and create initial schemas',
        status: TaskStatus.InProgress,
        priority: TaskPriority.High,
        dueDate: '2026-03-15',
        createdAt: '2026-02-20',
        assignedTo: 2,
      },
      {
        id: 3,
        title: 'Write Documentation',
        description: 'Complete API documentation and user guides',
        status: TaskStatus.Todo,
        priority: TaskPriority.Medium,
        dueDate: '2026-03-20',
        createdAt: '2026-03-01',
        assignedTo: 3,
      },
    ];
  }

  openDeleteModal(id?: number): void {
    this.taskToDeleteId = id!;
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (this.taskToDeleteId !== null) {
      this.tasks = this.tasks.filter((task) => task.id !== this.taskToDeleteId);
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

      status: TaskStatus.Todo,
      priority: TaskPriority.Medium,
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
        const taskIndex = this.tasks.findIndex((t) => t.id === this.taskToEditId);
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = {
            id: this.taskToEditId,
            title: formValue.title,
            description: formValue.description,
            status: formValue.status,
            priority: formValue.priority,
            dueDate: formValue.dueDate,
            createdAt: this.tasks[taskIndex].createdAt,
            assignedTo: formValue.assignedTo,
          };
        }
      } else {
        const newTask: Task = {
          title: formValue.title,
          description: formValue.description,
          status: formValue.status,
          priority: formValue.priority,
          dueDate: formValue.dueDate,
          createdAt: new Date().toISOString().split('T')[0],
          assignedTo: formValue.assignedTo,
        };
        this.tasks.push(newTask);
      }
      this.closeTaskModal();
    }
  }

  private closeTaskModal(): void {
    this.isTaskModalOpen = false;
    this.taskForm.reset({
      status: TaskStatus.Todo,
      priority: TaskPriority.Medium,
      assignedTo: 1,
    });
  }
}
