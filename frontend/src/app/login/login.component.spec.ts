import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({ template: '' })
class DummyComponent {}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        HttpClientTestingModule,
        FormsModule,
        CommonModule,
        RouterTestingModule.withRoutes([
          { path: 'dashboard', component: DummyComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if email or password is empty', () => {
    component.email = '';
    component.password = '';
    component.onLogin();
    expect(component.errorMessage).toBe('Bitte geben Sie E-Mail und Passwort ein.');

    component.email = 'test@test.com';
    component.password = '';
    component.onLogin();
    expect(component.errorMessage).toBe('Bitte geben Sie E-Mail und Passwort ein.');

    component.email = '';
    component.password = 'test';
    component.onLogin();
    expect(component.errorMessage).toBe('Bitte geben Sie E-Mail und Passwort ein.');
  });

  it('should login successfully and navigate to dashboard', fakeAsync(() => {
    spyOn(router, 'navigate');
    component.email = 'test@test.com';
    component.password = 'test';
    component.onLogin();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@test.com',
      password: 'test'
    });

    req.flush({ token: 'fake-token' });
    tick();
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify({ email: 'test@test.com' }));
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.errorMessage).toBe('');
  }));

  it('should show error message on login failure', () => {
    component.email = 'test@test.com';
    component.password = 'wrong-password';
    component.onLogin();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/login`);
    req.error(new ErrorEvent('Unauthorized'));
    expect(component.errorMessage).toBe('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.');
  });

  it('should navigate to registration on registration click', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.onRegistrationClick();
    expect(navigateSpy).toHaveBeenCalledWith(['/registration']);
  });

  it('should navigate to forgot-password on forgot-password click', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.onForgotPasswordClick();
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot-password']);
  });

  it('should bind email and password inputs correctly', async () => {
    const emailDebug = fixture.debugElement.query(By.css('#email'));
    const passwordDebug = fixture.debugElement.query(By.css('#password'));
    const emailInput = emailDebug.nativeElement;
    const passwordInput = passwordDebug.nativeElement;

    expect(emailInput).toBeTruthy('Email input not found');
    expect(passwordInput).toBeTruthy('Password input not found');

    component.email = 'test@test.com';
    component.password = 'test';
    fixture.detectChanges();

    await fixture.whenStable();

    expect(emailInput.value).toBe('test@test.com', 'Email input value should match component.email');
    expect(passwordInput.value).toBe('test', 'Password input value should match component.password');

    emailInput.value = 'test@test.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'newpassword';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    await fixture.whenStable();

    expect(component.email).toBe('test@test.com', 'Component email should update from input');
    expect(component.password).toBe('newpassword', 'Component password should update from input');
  });

  it('should show error message when submitting empty form via UI', () => {
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-text');
    expect(errorMessage.textContent).toContain('Bitte geben Sie E-Mail und Passwort ein.');
    httpMock.expectNone(`${environment.apiUrl}/api/login`);
  });

  it('should login successfully when form is submitted with valid credentials via UI', fakeAsync(() => {
    spyOn(router, 'navigate');
    const emailInput = fixture.nativeElement.querySelector('#email');
    const passwordInput = fixture.nativeElement.querySelector('#password');
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

    emailInput.value = 'test@test.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'test';
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    submitButton.click();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@test.com',
      password: 'test'
    });

    req.flush({ token: 'fake-token' });
    tick();
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify({ email: 'test@test.com' }));
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should not show error message initially', () => {
    const errorMessage = fixture.nativeElement.querySelector('.error-text');
    expect(errorMessage).toBeNull();
  });

  it('should navigate to registration when "Registrieren" link is clicked via UI', () => {
    const routerSpy = spyOn(router, 'navigate');
    const link = fixture.nativeElement.querySelectorAll('.small-text')[1];
    link.click();
    expect(routerSpy).toHaveBeenCalledWith(['/registration']);
  });

  it('should navigate to forgot-password when "Passwort vergessen" link is clicked via UI', () => {
    const routerSpy = spyOn(router, 'navigate');
    const link = fixture.nativeElement.querySelectorAll('.small-text')[0];
    link.click();
    expect(routerSpy).toHaveBeenCalledWith(['/forgot-password']);
  });
});