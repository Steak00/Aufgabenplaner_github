import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsComponent } from './terms.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('TermsComponent', () => {
  let component: TermsComponent;
  let fixture: ComponentFixture<TermsComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsComponent, RouterTestingModule, CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TermsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the terms title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1.section-title');
    expect(title).toBeTruthy();
    expect(title?.textContent).toContain('Allgemeine Geschäftsbedingungen');
  });

  it('should render the subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const subtitle = compiled.querySelector('p.body-text');
    expect(subtitle).toBeTruthy();
    expect(subtitle?.textContent).toContain('TaskIt – Dein Helfer im Chaos');
  });

  it('should render section headings', () => {
    const sectionHeadings = fixture.debugElement.queryAll(By.css('h2.sub-title'));
    expect(sectionHeadings.length).toBe(7);
    expect(sectionHeadings[0].nativeElement.textContent).toContain('1. Geltungsbereich');
    expect(sectionHeadings[6].nativeElement.textContent).toContain('7. Schlussbestimmungen');
  });

  it('should render content paragraphs', () => {
    const paragraphs = fixture.debugElement.queryAll(By.css('p.body-text'));
    expect(paragraphs.length).toBeGreaterThanOrEqual(7);
    expect(paragraphs[1].nativeElement.textContent).toContain('Willkommen bei TaskIt!');
  });

  it('should render the back link', () => {
    const backLink = fixture.debugElement.query(By.css('a.small-text.link'));
    expect(backLink).toBeTruthy();
    expect(backLink.nativeElement.textContent).toContain('Zurück');
  });

  it('should navigate to registration when back link is clicked', () => {
    const navigateSpy = spyOn(router, 'navigate');
    const backLink = fixture.debugElement.query(By.css('a.small-text.link'));
    backLink.triggerEventHandler('click', null);
    expect(navigateSpy).toHaveBeenCalledWith(['/registration']);
  });

  it('should call onBackClick and navigate to registration', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.onBackClick();
    expect(navigateSpy).toHaveBeenCalledWith(['/registration']);
  });
});