import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfirmOptions, ConfirmState } from '../models/confirm-dialog.model';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private dialogStateSubject = new BehaviorSubject<ConfirmState | null>(null);
  public dialogState$: Observable<ConfirmState | null> = this.dialogStateSubject.asObservable();

  /**
   * Opens the confirmation dialog and returns a Promise that resolves to true (confirmed) or false (cancelled).
   */
  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const state: ConfirmState = {
        options: {
          title: options.title || 'Confirm Action',
          message: options.message,
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          type: options.type || 'info',
        },
        resolver: resolve,
      };
      this.dialogStateSubject.next(state);
    });
  }

  /**
   * Closes the confirmation dialog with the user's decision.
   */
  close(result: boolean, state: ConfirmState): void {
    this.dialogStateSubject.next(null);
    if (state && state.resolver) {
      state.resolver(result);
    }
  }
}
