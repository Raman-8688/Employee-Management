import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { ConfirmState } from '../../models/confirm-dialog.model';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  currentState: ConfirmState | null = null;
  private subscription!: Subscription;

  constructor(private confirmDialogService: ConfirmDialogService) {}

  ngOnInit(): void {
    this.subscription = this.confirmDialogService.dialogState$.subscribe(
      (state) => {
        this.currentState = state;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onConfirm(): void {
    if (this.currentState) {
      this.confirmDialogService.close(true, this.currentState);
    }
  }

  onCancel(): void {
    if (this.currentState) {
      this.confirmDialogService.close(false, this.currentState);
    }
  }

  // Handle ESC key press to close modal cleanly
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(): void {
    if (this.currentState) {
      this.onCancel();
    }
  }
}
