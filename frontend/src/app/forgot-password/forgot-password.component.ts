import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  message = '';
  errorMessage = '';

  private apiUrl = `${environment.apiUrl}/api/forgot-password`;

  constructor(private http: HttpClient, private router: Router) { }

  sendResetLink() {
    if (!this.email) {
      this.errorMessage = 'Bitte E-Mail-Adresse eingeben.';
      return;
    }

    this.errorMessage = '';
    this.http.post(this.apiUrl, { email: this.email }, { responseType: 'text' as 'json' }).subscribe({
      next: (response) => {
        console.log('Antwort:', response);
        this.message = 'Ein Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail gesendet.';
        this.email = '';
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'E-Mail konnte nicht gefunden werden oder Serverfehler.';
        
      }
    });
  }

  onLoginClick() {
    this.router.navigate(['/login']);
  }
}
