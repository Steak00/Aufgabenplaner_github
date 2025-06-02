// WORK IN PROGRESS

export interface Settings {
  general: {
    timezone: string; // e.g., 'Europe/Berlin'
    autoStartTimer: boolean;
  };
  notifications: {
    autoStatistics: boolean;
    reportFrequency: number; // Days, e.g., 7 for weekly
  };
  appearance: {
    darkTheme: boolean;
    colorPalette: string; // e.g., 'default', 'blue', 'green'
  };
  account: {
    email: string; // For display only, changes handled via button
  };
}