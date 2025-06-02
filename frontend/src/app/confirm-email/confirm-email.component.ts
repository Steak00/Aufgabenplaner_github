import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css'],
  imports: [FormsModule, CommonModule],
})
export class ConfirmEmailComponent implements OnInit {


  private apiUrl = `${environment.apiUrl}/api/confirm-email`;

  message = 'Bestätige E-Mail...';
  errorMessage = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.http.get(`${environment.apiUrl}/api/confirm-email?token=${token}`).subscribe({
        next: (res) => {
          this.message = 'E-Mail erfolgreich bestätigt!';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          if (err.error) {
            this.errorMessage = err.error;
          } else {
            this.errorMessage = 'Unbekannter Fehler beim Bestätigen.';
          }
          }
          
      });
    }
  }

  onLoginClick(): void {
    this.router.navigate(['/login']);
  }
}


