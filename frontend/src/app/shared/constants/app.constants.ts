import { environment } from '../../../../environments/environment';

export const APP_CONSTANTS = {
  API_BASE_URL: environment.apiUrl,
  DEFAULT_DIALOG: {
    CONFIRM_TEXT: 'Confirm',
    CANCEL_TEXT: 'Cancel',
    DELETE_TITLE: 'Confirm Deletion',
    DELETE_MESSAGE: 'Are you sure you want to delete this item? This action cannot be undone.'
  }
};
