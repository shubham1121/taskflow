import { ToastType } from "./toast-type.enum";

export interface ToastModel {
  toastHeading: string;
  toastMessage: string;
  type: ToastType;
}