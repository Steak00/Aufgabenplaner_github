import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { SettingsService } from '../settings.service';
import { Settings } from '../settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent, NavigationComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  settings: Settings; // Remove | null since we initialize it
  settingsForm: FormGroup;
  activeTab: string = 'general';
  private settingsSubscription: Subscription | null = null;
  showDeleteConfirm: boolean = false;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) {
    // Initialize settings with a default value
    this.settings = {
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
        email: JSON.parse(localStorage.getItem('user') || '{}').email || 'N/A',
      },
    };

    this.settingsForm = this.fb.group({
      timezone: [this.settings.general.timezone],
      autoStartTimer: [this.settings.general.autoStartTimer],
      autoStatistics: [this.settings.notifications.autoStatistics],
      reportFrequency: [this.settings.notifications.reportFrequency],
      darkTheme: [this.settings.appearance.darkTheme],
      colorPalette: [this.settings.appearance.colorPalette],
    });
  }

  ngOnInit() {
    this.settingsSubscription = this.settingsService.settings$.subscribe((settings) => {
      this.settings = settings; // Always assign a non-null value
      this.settingsForm.patchValue({
        timezone: settings.general.timezone,
        autoStartTimer: settings.general.autoStartTimer,
        autoStatistics: settings.notifications.autoStatistics,
        reportFrequency: settings.notifications.reportFrequency,
        darkTheme: settings.appearance.darkTheme,
        colorPalette: settings.appearance.colorPalette,
      });
    });

    this.settingsForm.valueChanges.subscribe((values) => {
      this.settingsService.updateSettings({
        general: {
          timezone: values.timezone,
          autoStartTimer: values.autoStartTimer,
        },
        notifications: {
          autoStatistics: values.autoStatistics,
          reportFrequency: values.reportFrequency,
        },
        appearance: {
          darkTheme: values.darkTheme,
          colorPalette: values.colorPalette,
        },
      });
    });
  }

  ngOnDestroy() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  exportCsv() {
    this.settingsService.exportDataAsCsv();
  }

  changeEmail() {
    this.settingsService.initiateEmailChange();
  }

  changePassword() {
    this.settingsService.initiatePasswordChange();
  }

  confirmDeleteAccount() {
    this.showDeleteConfirm = true;
  }

  deleteAccount() {
    this.settingsService.deleteAccount();
    this.showDeleteConfirm = false;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }
}