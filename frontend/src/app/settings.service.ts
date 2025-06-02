// WORK IN PROGRESS

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Settings } from './settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settingsSubject$ = new BehaviorSubject<Settings>(this.loadSettings());
  settings$: Observable<Settings> = this.settingsSubject$.asObservable();

  constructor() {}

  private loadSettings(): Settings {
    const defaultSettings: Settings = {
      general: {
        timezone: 'Europe/Berlin',
        autoStartTimer: false,
      },
      notifications: {
        autoStatistics: false,
        reportFrequency: 7,
      },
      appearance: {
        darkTheme: false,
        colorPalette: 'default',
      },
      account: {
        email: JSON.parse(localStorage.getItem('user') || '{}').email || '',
      },
    };
    const storedSettings = localStorage.getItem('settings');
    return storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : defaultSettings;
  }

  updateSettings(settings: Partial<Settings>) {
    const currentSettings = this.settingsSubject$.value;
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem('settings', JSON.stringify(updatedSettings));
    this.settingsSubject$.next(updatedSettings);
  }

  exportDataAsCsv() {
    // Placeholder: Implement CSV export logic (mock for now)
    console.log('Exporting data as CSV...');
    // In a real scenario, fetch tasks via TaskService and generate CSV
    alert('CSV export initiated (placeholder).');
  }

  initiateEmailChange() {
    // Placeholder: Redirect to a future email change page or open a modal
    console.log('Initiating email change...');
    alert('Email change not implemented yet.');
  }

  initiatePasswordChange() {
    // Placeholder: Redirect to reset-password or open a modal
    console.log('Initiating password change...');
    alert('Password change not implemented yet.');
  }

  deleteAccount() {
    // Placeholder: Simulate account deletion with confirmation
    if (confirm('Konto wirklich löschen?')) {
      console.log('Deleting account...');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('settings');
      alert('Account deleted (placeholder).');
      // In a real scenario, call a backend endpoint
      window.location.href = '/login'; // Redirect to login
    }
  }
}