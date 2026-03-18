import { Injectable } from "@angular/core";
import { ToastHandler } from "./toast-handler-service";
import { ToastType } from "../shared/constants/toast-type.enum";

@Injectable({
  providedIn: 'root'
})
export class ApiErrorHandlerService {

    constructor(private readonly toastHandlerService : ToastHandler) {}

  handleError(error: any): void {
    console.error('API Error:', error);
    if (error.status === 0) {
        this.toastHandlerService.showToast({
            toastHeading: 'Connection Error',
            toastMessage: 'Unable to connect to the server. Please check your internet connection.',
            type: ToastType.Error
        });
    } else if (error.status >= 500) {
        this.toastHandlerService.showToast({
            toastHeading: 'Server Error',
            toastMessage: 'An error occurred on the server. Please try again later.',
            type: ToastType.Error
        });
    } else if (error.status >= 400) {
        this.toastHandlerService.showToast({
            toastHeading: 'Client Error',
            toastMessage: error.error?.message || 'An error occurred while processing your request.',
            type: ToastType.Error
        });
    }   else {
        this.toastHandlerService.showToast({
            toastHeading: 'Unexpected Error',
            toastMessage: 'An unexpected error occurred. Please try again.',
            type: ToastType.Error
        });
    }
  }
}