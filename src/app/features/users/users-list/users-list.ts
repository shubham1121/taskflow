import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserModel } from '../models/users-model';
import { UsersFacade } from '../facade/users-facade';
import { Subscription } from 'rxjs';
import { ToastHandler } from '../../../core/toast-handler-service';
import { ToastType } from '../../../shared/constants/toast-type.enum';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private usersFacadeService = inject(UsersFacade);
  private toastService = inject(ToastHandler);
  users : UserModel[] = [];
  isDeleteModalOpen = false;
  userToDeleteId: number | null = null;
  isAddUserModalOpen = false;
  addUserForm: FormGroup;
  sub : Subscription = new Subscription();

  constructor() {
    this.addUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.sub = this.usersFacadeService.allUsers$.subscribe(users => {
      this.users = users;
    });
  }

  openDeleteModal(id: number): void {
    this.userToDeleteId = id;
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (this.userToDeleteId !== null) {
      this.usersFacadeService.deleteUser(this.userToDeleteId).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== this.userToDeleteId);
          this.toastService.showToast({
            toastHeading: 'User Deleted',
            toastMessage: `User with ID ${this.userToDeleteId} has been deleted successfully.`,
            type: ToastType.Success
          });
          this.closeDeleteModal();
        },
        error: (err) => {
          this.toastService.showToast({
            toastHeading: 'Delete Failed',
            toastMessage: err.message || 'Failed to delete user.',
            type: ToastType.Error
          });
          this.closeDeleteModal();
        }
      });
    }
  }

  cancelDelete(): void {
    this.closeDeleteModal();
  }

  private closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.userToDeleteId = null;
  }

  openAddUserModal(): void {
    this.isAddUserModalOpen = true;
    this.addUserForm.reset();
  }

  cancelAddUser(): void {
    this.closeAddUserModal();
  }

  submitAddUser(): void {
    if (this.addUserForm.valid) {
      const formValue = this.addUserForm.value;
      const newUser: UserModel = {
        name: formValue.name,
        email: formValue.email
      };
      this.usersFacadeService.createUser(newUser).subscribe((user) => {
        this.users.push(user);
        this.toastService.showToast({
          toastHeading: 'User Added',
          toastMessage: `User ${user.name} has been added successfully.`,
          type: ToastType.Success
        });
      });
      
      this.closeAddUserModal();
    }
  }

  private closeAddUserModal(): void {
    this.isAddUserModalOpen = false;
    this.addUserForm.reset();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
