import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  standalone: true,
  template: '<p>Dummy Component</p>',
})
class DummyComponent {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule.withRoutes([
          { path: 'dummy', component: DummyComponent },
        ]),
        DummyComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    await router.initialNavigation();
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the router-outlet', () => {
    const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutlet).toBeTruthy();
  });

  it('should render child route content', async () => {
    await router.navigate(['/dummy']);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const dummyContent = compiled.querySelector('p');
    expect(dummyContent).toBeTruthy();
    expect(dummyContent?.textContent).toContain('Dummy Component');
  });
});