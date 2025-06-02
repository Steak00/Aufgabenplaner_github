import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  private apiUrl = `${environment.apiUrl}/api/login`;

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Bitte geben Sie E-Mail und Passwort ein.';
      return;
    }

    this.errorMessage = '';

    this.http.post<any>(this.apiUrl, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify({ email: this.email }));
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.';
      }
    });
  }

  onRegistrationClick() {
    this.router.navigate(['/registration']);
  }

  onForgotPasswordClick() {
    this.router.navigate(['/forgot-password']);
  }
}
