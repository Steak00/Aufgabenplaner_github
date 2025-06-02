import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';


  private apiUrl = `${environment.apiUrl}/api/reset-password`;
  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  confirmToken(token: string) {
    this.http.get<any>(`${environment.apiUrl}/confirm-reset?token=${token}`, { responseType: 'text' as 'json' }).subscribe({
      next: response => {
        console.log('Antwort:', response);
        this.email = response.email;
      },
      error: (error) => {
        console.error('Fehler:', error);
        if (error.status === 403) {
          this.errorMessage = 'Ungültiger oder abgelaufener Token';
        } else {
          this.errorMessage = 'Ein Fehler ist aufgetreten';
        }
      }
    });
  }

  resetPassword() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwörter stimmen nicht überein.';
      return;
    }

    const body = {
      email: this.email,
      password: this.password,
      token: this.token
    };

    this.http.post(this.apiUrl, body, { responseType: 'text' as 'json' }).subscribe({
      next: (response) => {
        console.log('Antwort:', response);
        this.successMessage = 'Passwort erfolgreich geändert.';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (error) => {
        console.error('Fehler:', error);
        this.errorMessage = 'Fehler beim Zurücksetzen des Passworts.';
      }
    });
  }


  onLoginClick() {
    this.router.navigate(['/login']);
  }
}
