import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationComponent } from './navigation.component';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavigationComponent,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a');

    expect(links.length).toBe(5);
    expect(links[0].getAttribute('ng-reflect-router-link')).toBe('/dashboard');
    expect(links[0].textContent).toContain('Dashboard');
    expect(links[1].getAttribute('ng-reflect-router-link')).toBe('/tasks-list');
    expect(links[1].textContent).toContain('Aufgaben');
    expect(links[2].getAttribute('ng-reflect-router-link')).toBe('/timer');
    expect(links[2].textContent).toContain('Timer');
    expect(links[3].getAttribute('ng-reflect-router-link')).toBe('/evaluation');
    expect(links[3].textContent).toContain('Auswertungen');
    expect(links[4].getAttribute('ng-reflect-router-link')).toBe('/settings');
    expect(links[4].textContent).toContain('Einstellungen');
  });

  it('should have nav-bar class', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.classList).toContain('nav-bar');
  });
});