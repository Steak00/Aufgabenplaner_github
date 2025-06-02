import { NgModule } from '@angular/core';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { DashboardComponent } from './dashboard/dashboard.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { SettingsComponent } from './settings/settings.component';
import { TermsComponent } from './terms/terms.component';
import { TimerComponent } from './timer/timer.component';
import { TasksListComponent } from './tasks-list/tasks-list.component';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { TaskService } from './hello.service';
import { SettingsService } from './settings.service';
import { EvaluationService } from './evaluation.service';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    LoginComponent,
    RegistrationComponent,
    ForgotPasswordComponent,
    TermsComponent,
    TimerComponent,
    TasksListComponent,
    DashboardComponent,
    SettingsComponent,
    EvaluationComponent,
  ],
  providers: [TaskService, SettingsService, EvaluationService],
  bootstrap: [],
})
export class AppModule {}