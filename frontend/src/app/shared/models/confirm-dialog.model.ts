export type DialogType = 'danger' | 'warning' | 'info';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
}

export interface ConfirmState {
  options: ConfirmOptions;
  resolver: (result: boolean) => void;
}
