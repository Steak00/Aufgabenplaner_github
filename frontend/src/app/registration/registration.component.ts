import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  email = '';
  password = '';
  passwordRepeat = '';
  firstName = '';
  lastName = '';
  termsAccepted = false;
  errorMessage = '';

  private apiUrl = `${environment.apiUrl}/api/register`;

  constructor(private http: HttpClient, private router: Router) {}

  onRegistration() {
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.passwordRepeat) {
      this.errorMessage = 'Bitte füllen Sie alle Felder aus.';
      return;
    }
    if (this.password !== this.passwordRepeat) {
      this.errorMessage = 'Die Passwörter stimmen nicht überein.';
      return;
    }
    if (!this.termsAccepted) {
      this.errorMessage = 'Bitte akzeptieren Sie die AGB und Datenschutzrichtlinien.';
      return;
    }

    this.errorMessage = '';

    this.http
      .post<any>(this.apiUrl, {
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName
      })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify({ email: this.email }));
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage =
            'Registrierung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.';
          console.error(err);
        }
      });
  }

  onLoginClick() {
    this.router.navigate(['/login']);
  }

  onTermsClick() {
    this.router.navigate(['/terms']);
  }
}