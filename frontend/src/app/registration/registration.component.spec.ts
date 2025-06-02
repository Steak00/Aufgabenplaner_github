import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegistrationComponent } from './registration.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { By } from '@angular/platform-browser';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegistrationComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        CommonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationComponent);
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

  it('should show error if required fields are empty', () => {
    component.firstName = '';
    component.lastName = '';
    component.email = '';
    component.password = '';
    component.passwordRepeat = '';
    component.onRegistration();
    expect(component.errorMessage).toBe('Bitte füllen Sie alle Felder aus.');
  });

  it('should show error if passwords do not match', () => {
    component.firstName = 'Max';
    component.lastName = 'Mustermann';
    component.email = 'max@example.com';
    component.password = 'password';
    component.passwordRepeat = 'different';
    component.termsAccepted = true;
    component.onRegistration();
    expect(component.errorMessage).toBe('Die Passwörter stimmen nicht überein.');
  });

  it('should show error if terms are not accepted', () => {
    component.firstName = 'Max';
    component.lastName = 'Mustermann';
    component.email = 'max@example.com';
    component.password = 'password';
    component.passwordRepeat = 'password';
    component.termsAccepted = false;
    component.onRegistration();
    expect(component.errorMessage).toBe(
      'Bitte akzeptieren Sie die AGB und Datenschutzrichtlinien.'
    );
  });

  it('should call register API, save token, and navigate on successful registration', fakeAsync(() => {
    component.firstName = 'Max';
    component.lastName = 'Mustermann';
    component.email = 'max@example.com';
    component.password = 'password';
    component.passwordRepeat = 'password';
    component.termsAccepted = true;
    const navigateSpy = spyOn(router, 'navigate');
    component.onRegistration();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      password: 'password'
    });

    req.flush({ token: 'fake-token' });
    tick();

    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('user')).toBe(
      JSON.stringify({ email: 'max@example.com' })
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  }));

  it('should show error message on registration failure', fakeAsync(() => {
    component.firstName = 'Max';
    component.lastName = 'Mustermann';
    component.email = 'max@example.com';
    component.password = 'password';
    component.passwordRepeat = 'password';
    component.termsAccepted = true;
    component.onRegistration();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/register`);
    req.error(new ErrorEvent('Bad Request'));
    tick();

    expect(component.errorMessage).toBe(
      'Registrierung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.'
    );
  }));

  it('should navigate to login on login click', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.onLoginClick();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to terms on terms click', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.onTermsClick();
    expect(navigateSpy).toHaveBeenCalledWith(['/terms']);
  });

  it('should bind form fields correctly', () => {
    const form = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);

    component.firstName = 'John';
    component.lastName = 'Doe';
    component.email = 'john@example.com';
    component.password = 'password';
    component.passwordRepeat = 'password';
    component.termsAccepted = true;

    form.control.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password',
      passwordRepeat: 'password',
      termsAccepted: true
    });

    fixture.detectChanges();

    const firstNameInput = fixture.nativeElement.querySelector('#firstName');
    const lastNameInput = fixture.nativeElement.querySelector('#lastName');
    const emailInput = fixture.nativeElement.querySelector('#email');
    const passwordInput = fixture.nativeElement.querySelector('#password');
    const passwordRepeatInput = fixture.nativeElement.querySelector('#passwordRepeat');
    const termsCheckbox = fixture.nativeElement.querySelector('#terms');

    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('password');
    expect(passwordRepeatInput.value).toBe('password');
    expect(termsCheckbox.checked).toBe(true);

    firstNameInput.value = 'Jane';
    firstNameInput.dispatchEvent(new Event('input'));
    lastNameInput.value = 'Smith';
    lastNameInput.dispatchEvent(new Event('input'));
    emailInput.value = 'jane@example.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'newpassword';
    passwordInput.dispatchEvent(new Event('input'));
    passwordRepeatInput.value = 'newpassword';
    passwordRepeatInput.dispatchEvent(new Event('input'));
    termsCheckbox.checked = false;
    termsCheckbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.firstName).toBe('Jane');
    expect(component.lastName).toBe('Smith');
    expect(component.email).toBe('jane@example.com');
    expect(component.password).toBe('newpassword');
    expect(component.passwordRepeat).toBe('newpassword');
    expect(component.termsAccepted).toBe(false);
  });

  it('should show error when submitting empty form via UI', () => {
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-text');
    expect(errorMessage.textContent).toContain('Bitte füllen Sie alle Felder aus.');
    httpMock.expectNone(`${environment.apiUrl}/api/register`);
  });

  it('should show error when passwords do not match via UI', () => {
    const firstNameInput = fixture.nativeElement.querySelector('#firstName');
    const lastNameInput = fixture.nativeElement.querySelector('#lastName');
    const emailInput = fixture.nativeElement.querySelector('#email');
    const passwordInput = fixture.nativeElement.querySelector('#password');
    const passwordRepeatInput = fixture.nativeElement.querySelector('#passwordRepeat');
    const termsCheckbox = fixture.nativeElement.querySelector('#terms');
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

    firstNameInput.value = 'John';
    lastNameInput.value = 'Doe';
    emailInput.value = 'john@example.com';
    passwordInput.value = 'password';
    passwordRepeatInput.value = 'different';
    termsCheckbox.checked = true;

    [firstNameInput, lastNameInput, emailInput, passwordInput, passwordRepeatInput].forEach(input => 
      input.dispatchEvent(new Event('input'))
    );
    termsCheckbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    submitButton.click();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-text');
    expect(errorMessage.textContent).toContain('Die Passwörter stimmen nicht überein.');
    httpMock.expectNone(`${environment.apiUrl}/api/register`);
  });

  it('should show error when terms are not accepted via UI', () => {
    const firstNameInput = fixture.nativeElement.querySelector('#firstName');
    const lastNameInput = fixture.nativeElement.querySelector('#lastName');
    const emailInput = fixture.nativeElement.querySelector('#email');
    const passwordInput = fixture.nativeElement.querySelector('#password');
    const passwordRepeatInput = fixture.nativeElement.querySelector('#passwordRepeat');
    const termsCheckbox = fixture.nativeElement.querySelector('#terms');
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

    firstNameInput.value = 'John';
    lastNameInput.value = 'Doe';
    emailInput.value = 'john@example.com';
    passwordInput.value = 'password';
    passwordRepeatInput.value = 'password';
    termsCheckbox.checked = false;

    [firstNameInput, lastNameInput, emailInput, passwordInput, passwordRepeatInput].forEach(input => 
      input.dispatchEvent(new Event('input'))
    );
    termsCheckbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    submitButton.click();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-text');
    expect(errorMessage.textContent).toContain('Bitte akzeptieren Sie die AGB und Datenschutzrichtlinien.');
    httpMock.expectNone(`${environment.apiUrl}/api/register`);
  });

  it('should register successfully when form is submitted with valid data via UI', fakeAsync(() => {
    const firstNameInput = fixture.nativeElement.querySelector('#firstName');
    const lastNameInput = fixture.nativeElement.querySelector('#lastName');
    const emailInput = fixture.nativeElement.querySelector('#email');
    const passwordInput = fixture.nativeElement.querySelector('#password');
    const passwordRepeatInput = fixture.nativeElement.querySelector('#passwordRepeat');
    const termsCheckbox = fixture.nativeElement.querySelector('#terms');
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

    firstNameInput.value = 'John';
    lastNameInput.value = 'Doe';
    emailInput.value = 'john@example.com';
    passwordInput.value = 'password';
    passwordRepeatInput.value = 'password';
    termsCheckbox.checked = true;

    [firstNameInput, lastNameInput, emailInput, passwordInput, passwordRepeatInput].forEach(input => 
      input.dispatchEvent(new Event('input'))
    );
    termsCheckbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const navigateSpy = spyOn(router, 'navigate');
    submitButton.click();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password'
    });

    req.flush({ token: 'fake-token' });
    tick();

    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify({ email: 'john@example.com' }));
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  }));

  it('should show error message when registration fails via UI', fakeAsync(() => {
    const firstNameInput = fixture.nativeElement.querySelector('#firstName');
    const lastNameInput = fixture.nativeElement.querySelector('#lastName');
    const emailInput = fixture.nativeElement.querySelector('#email');
    const passwordInput = fixture.nativeElement.querySelector('#password');
    const passwordRepeatInput = fixture.nativeElement.querySelector('#passwordRepeat');
    const termsCheckbox = fixture.nativeElement.querySelector('#terms');
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

    firstNameInput.value = 'John';
    lastNameInput.value = 'Doe';
    emailInput.value = 'john@example.com';
    passwordInput.value = 'password';
    passwordRepeatInput.value = 'password';
    termsCheckbox.checked = true;

    [firstNameInput, lastNameInput, emailInput, passwordInput, passwordRepeatInput].forEach(input => 
      input.dispatchEvent(new Event('input'))
    );
    termsCheckbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    submitButton.click();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/register`);
    req.error(new ErrorEvent('Bad Request'));
    tick();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-text');
    expect(errorMessage.textContent).toContain('Registrierung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.');
  }));

  it('should navigate to login when "Anmelden" link is clicked via UI', () => {
    const link = fixture.nativeElement.querySelector('.links a');
    const navigateSpy = spyOn(router, 'navigate');
    link.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to terms when "AGB" link is clicked via UI', () => {
    const link = fixture.nativeElement.querySelector('label a');
    const navigateSpy = spyOn(router, 'navigate');
    link.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/terms']);
  });
});