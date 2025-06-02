import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, of } from 'rxjs';
import { TimerService } from '../timer.service';
import { TaskService } from '../hello.service';
import { TimerState } from '../timer-state.model';
import { FormatTimePipe } from '../format-time.pipe';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;
  let routerEventsSubject: Subject<any>;
  let timerService: jasmine.SpyObj<TimerService>;
  let taskService: jasmine.SpyObj<TaskService>;

  const mockTimerState: TimerState = {
    timeRemaining: 25 * 60,
    isRunning: false,
    currentPhase: 'Arbeitszeit',
    currentCycle: 1,
    workInterval: 25,
    shortBreak: 5,
    longBreak: 15,
    cycles: 4
  };

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    const timerServiceSpy = jasmine.createSpyObj('TimerService', ['startTimer', 'pauseTimer', 'resetTimer'], {
      state$: of(mockTimerState)
    });
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['clearLockedTask']);

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule.withRoutes([]),
        CommonModule,
        FormatTimePipe
      ],
      providers: [
        { provide: TimerService, useValue: timerServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    timerService = TestBed.inject(TimerService) as jasmine.SpyObj<TimerService>;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;

    // Mock router events
    spyOnProperty(router, 'events', 'get').and.returnValue(routerEventsSubject.asObservable());
    // Mock router.url
    spyOnProperty(router, 'url', 'get').and.returnValue('/dashboard');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set subtitle based on route', () => {
    component.setSubtitle('/dashboard');
    expect(component.subtitle).toBe('/ Erfolg in Aussicht');
    component.setSubtitle('/tasks-list');
    expect(component.subtitle).toBe('/ Aufgabenverwaltung');
    component.setSubtitle('/timer');
    expect(component.subtitle).toBe('/ Pomodoro Timer');
    component.setSubtitle('/evaluation');
    expect(component.subtitle).toBe('/ Auswertungen');
    component.setSubtitle('/settings');
    expect(component.subtitle).toBe('/ Einstellungen');
    component.setSubtitle('/login');
    expect(component.subtitle).toBeNull();
  });

  it('should update subtitle on navigation end', fakeAsync(() => {
    routerEventsSubject.next(new NavigationEnd(1, '/tasks-list', '/tasks-list'));
    tick();
    expect(component.subtitle).toBe('/ Aufgabenverwaltung');
  }));

  it('should show timer based on route', () => {
    component.setShowTimer('/dashboard');
    expect(component.showTimer).toBeTrue();
    component.setShowTimer('/timer');
    expect(component.showTimer).toBeFalse();
  });

  it('should toggle timer state', () => {
    component.state = { ...mockTimerState, isRunning: false };
    component.toggleTimer();
    expect(timerService.startTimer).toHaveBeenCalled();
    component.state = { ...mockTimerState, isRunning: true };
    component.toggleTimer();
    expect(timerService.pauseTimer).toHaveBeenCalled();
  });

  it('should handle logout', fakeAsync(() => {
    spyOn(localStorage, 'removeItem').and.callThrough();
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.logout();
    tick();
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(timerService.resetTimer).toHaveBeenCalled();
    expect(taskService.clearLockedTask).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  }));

  it('should render header text and subtitle', () => {
    component.subtitle = '/ Erfolg in Aussicht';
    fixture.detectChanges();
    const headerText = fixture.nativeElement.querySelector('.header-text');
    const subtitleText = fixture.nativeElement.querySelector('.subtitle');
    expect(headerText.textContent).toContain('TaskIt');
    expect(subtitleText.textContent).toContain('/ Erfolg in Aussicht');
  });

  it('should render timer when showTimer is true', fakeAsync(() => {
    component.showTimer = true;
    fixture.detectChanges();
    tick();
    const timerCircle = fixture.nativeElement.querySelector('.timer-circle');
    expect(timerCircle).toBeTruthy();
  }));

  it('should not render timer when showTimer is false', () => {
    component.showTimer = false;
    fixture.detectChanges();
    const timerCircle = fixture.nativeElement.querySelector('.timer-circle');
    expect(timerCircle).toBeNull();
  });

  it('should call toggleTimer when play button is clicked', () => {
    spyOn(component, 'toggleTimer');
    component.showTimer = true;
    fixture.detectChanges();
    const playButton = fixture.nativeElement.querySelector('.btn-play');
    playButton.click();
    expect(component.toggleTimer).toHaveBeenCalled();
  });

  it('should call logout when logout button is clicked', () => {
    spyOn(component, 'logout');
    const logoutButton = fixture.nativeElement.querySelector('.logout-btn');
    logoutButton.click();
    expect(component.logout).toHaveBeenCalled();
  });
});