import { Injectable } from "@angular/core";
import { ToastModel } from "../shared/constants/toast-model";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ToastHandler {
    private toastSubject = new Subject<ToastModel>();
    toast$ = this.toastSubject.asObservable();

    showToast(toast: ToastModel): void {
        this.toastSubject.next(toast);
    }
}