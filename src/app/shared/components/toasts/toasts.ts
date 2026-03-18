import { Component, OnInit } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { ToastType } from '../../constants/toast-type.enum';
import { ToastHandler } from '../../../core/toast-handler-service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toasts',
  imports: [NgClass],
  templateUrl: './toasts.html',
  styleUrl: './toasts.scss',
})
export class Toasts implements OnInit {
  ToastType = ToastType;  // Expose enum to template
  toastHeading : string = '';
  toastMessage : string = '';
  toastType : ToastType = ToastType.Info;

  constructor(private readonly toastHandlerService: ToastHandler) {}

  ngOnInit(): void {
    this.toastHandlerService.toast$.subscribe((toast) => {
      this.showToast(toast.type, toast.toastHeading, toast.toastMessage);
    });
  }

  private showToast(type: ToastType, heading: string, message: string): void {
    this.toastType = type;
    this.toastHeading = heading;
    this.toastMessage = message;
    
    // Use setTimeout to ensure DOM has been updated with new values
    setTimeout(() => {
      const toastElement = document.getElementById('liveToast');
      if (toastElement) {
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastElement);
        toastBootstrap.show();
      } else {
        console.error('Toast element not found');
      }
    }, 0);
  }

}
