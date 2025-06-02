import { DashboardComponent } from './dashboard/dashboard.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SettingsComponent } from './settings/settings.component';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import { TermsComponent } from './terms/terms.component';
import { TimerComponent } from './timer/timer.component';

import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // ''   = Standard
  //{ path: '**', redirectTo: 'login' },                  // '**' = Fallback
  { path: 'confirm-email',    component: ConfirmEmailComponent    },
  { path: 'dashboard',        component: DashboardComponent,      canActivate: [AuthGuard] },
  { path: 'evaluation',       component: EvaluationComponent,     canActivate: [AuthGuard] },
  { path: 'forgot-password',  component: ForgotPasswordComponent  },
  { path: 'login',            component: LoginComponent           },
  { path: 'registration',     component: RegistrationComponent    },  
  { path: 'reset-password',   component: ResetPasswordComponent   },
  { path: 'settings',         component: SettingsComponent,       canActivate: [AuthGuard] },
  { path: 'tasks-list',       component: TasksListComponent,      canActivate: [AuthGuard] },
  { path: 'terms',            component: TermsComponent           },
  { path: 'timer',            component: TimerComponent,          canActivate: [AuthGuard] },
];
