import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let httpMock: HttpTestingController;
  let route: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ResetPasswordComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        CommonModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ token: 'fake-token' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    route = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set token from query params on init', () => {
    expect(component.token).toBe('fake-token');
  });

  it('should bind password inputs correctly', async () => {
    component.password = 'newpass';
    component.confirmPassword = 'newpass';
    fixture.detectChanges();
    await fixture.whenStable();
    const passwordInput = fixture.nativeElement.querySelector('#newPassword');
    const confirmInput = fixture.nativeElement.querySelector('#confirmPassword');
    expect(passwordInput.value).toBe('newpass');
    expect(confirmInput.value).toBe('newpass');
  });

  it('should set error message if token is invalid', () => {
    component.confirmToken('invalid-token');
    const req = httpMock.expectOne(`${environment.apiUrl}/confirm-reset?token=invalid-token`);
    req.flush('Invalid token', { status: 403, statusText: 'Forbidden' });
    expect(component.errorMessage).toBe('Ungültiger oder abgelaufener Token');
  });

  it('should set error message on server error during token confirmation', () => {
    component.confirmToken('fake-token');
    const req = httpMock.expectOne(`${environment.apiUrl}/confirm-reset?token=fake-token`);
    req.flush('Server error', { status: 500, statusText: 'Server Error' });
    expect(component.errorMessage).toBe('Ein Fehler ist aufgetreten');
  });

  it('should show error if passwords do not match', () => {
    component.password = 'newpassword';
    component.confirmPassword = 'different';
    component.resetPassword();
    expect(component.errorMessage).toBe('Passwörter stimmen nicht überein.');
  });

  it('should reset password and navigate to login on success', fakeAsync(() => {
    component.email = 'test@test.com';
    component.token = 'fake-token';
    component.password = 'newpassword';
    component.confirmPassword = 'newpassword';
    const navigateSpy = spyOn(component['router'], 'navigate');

    component.resetPassword();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/reset-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@test.com',
      password: 'newpassword',
      token: 'fake-token'
    });

    req.flush('Password reset successful');
    expect(component.successMessage).toBe('Passwort erfolgreich geändert.');

    tick(3000);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  }));

  it('should show error message on reset password failure', () => {
    component.email = 'test@test.com';
    component.token = 'fake-token';
    component.password = 'newpassword';
    component.confirmPassword = 'newpassword';

    component.resetPassword();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/reset-password`);
    req.error(new ErrorEvent('Bad Request'));
    expect(component.errorMessage).toBe('Fehler beim Zurücksetzen des Passworts.');
  });

  it('should display the form initially', () => {
    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeTruthy();
  });

  it('should hide the form and show success message when successful', () => {
    component.successMessage = 'Passwort erfolgreich geändert.';
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form');
    const successDiv = fixture.nativeElement.querySelector('.success');
    expect(form).toBeNull();
    expect(successDiv.textContent).toContain('Passwort erfolgreich geändert.');
  });

  it('should display error message in UI', () => {
    component.errorMessage = 'Fehler';
    fixture.detectChanges();
    const errorDiv = fixture.nativeElement.querySelector('.error');
    expect(errorDiv.textContent).toContain('Fehler');
  });

  it('should show error when submitting with mismatched passwords via UI', () => {
    const passwordInput = fixture.nativeElement.querySelector('#newPassword');
    const confirmInput = fixture.nativeElement.querySelector('#confirmPassword');
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

    passwordInput.value = 'pass1';
    confirmInput.value = 'pass2';
    passwordInput.dispatchEvent(new Event('input'));
    confirmInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    submitButton.click();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-text');
    expect(errorMessage.textContent).toContain('Passwörter stimmen nicht überein.');
  });

  it('should call reset password API when form is submitted with matching passwords', () => {
    component.email = 'test@test.com';
    component.token = 'fake-token';

    const passwordInput = fixture.nativeElement.querySelector('#newPassword');
    const confirmInput = fixture.nativeElement.querySelector('#confirmPassword');
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

    passwordInput.value = 'newpass';
    confirmInput.value = 'newpass';
    passwordInput.dispatchEvent(new Event('input'));
    confirmInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    submitButton.click();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/reset-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@test.com',
      password: 'newpass',
      token: 'fake-token'
    });

    req.flush('Password reset successful');
    fixture.detectChanges();

    const successMessage = fixture.nativeElement.querySelector('.success');
    expect(successMessage.textContent).toContain('Passwort erfolgreich geändert.');
  });

  it('should navigate to login when "Zurück zum Login" is clicked', () => {
    const link = fixture.nativeElement.querySelector('.link');
    const routerSpy = spyOn(component['router'], 'navigate');
    link.click();
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });
});