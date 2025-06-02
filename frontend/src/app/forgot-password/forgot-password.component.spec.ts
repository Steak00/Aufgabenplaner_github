import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { By } from '@angular/platform-browser';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ForgotPasswordComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if email is empty', () => {
    component.email = '';
    component.sendResetLink();
    expect(component.errorMessage).toBe('Bitte E-Mail-Adresse eingeben.');
  });

  it('should send reset link and show success message on success', () => {
    component.email = 'test@test.com';
    component.sendResetLink();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/forgot-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@test.com' });

    req.flush('Reset link sent');
    expect(component.message).toBe('Ein Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail gesendet.');
    expect(component.email).toBe('');
    expect(component.errorMessage).toBe('');
  });

  it('should show error message on API failure', () => {
    component.email = 'test@test.com';
    component.sendResetLink();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/forgot-password`);
    req.error(new ErrorEvent('Bad Request'));

    expect(component.errorMessage).toBe('E-Mail konnte nicht gefunden werden oder Serverfehler.');
    expect(component.message).toBe('');
  });

  it('should navigate to login on login click', () => {
    const routerSpy = spyOn(component['router'], 'navigate');
    component.onLoginClick();
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should show error message when submitting empty form via UI', fakeAsync(() => {
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    submitButton.click();
    fixture.detectChanges();
    tick();

    const errorMessage = fixture.debugElement.query(By.css('.error-text')).nativeElement;
    expect(errorMessage.textContent).toContain('Bitte E-Mail-Adresse eingeben.');
    httpMock.expectNone(`${environment.apiUrl}/api/forgot-password`);
  }));

  it('should not show messages initially', fakeAsync(() => {
    fixture.detectChanges();
    const successMessage = fixture.debugElement.query(By.css('.success-text'));
    const errorMessage = fixture.debugElement.query(By.css('.error-text'));
    expect(successMessage).toBeNull();
    expect(errorMessage).toBeNull();
  }));

  it('should navigate to login when "Zurück zum Login" link is clicked via UI', fakeAsync(() => {
    fixture.detectChanges();
    const routerSpy = spyOn(component['router'], 'navigate');
    const link = fixture.debugElement.query(By.css('.link')).nativeElement;
    link.click();
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  }));
});