import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TimerComponent } from './timer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TimerService } from '../timer.service';
import { TaskService } from '../hello.service';
import { TimerState } from '../timer-state.model';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { BehaviorSubject, of } from 'rxjs';
import { Task } from '../task.model';
import { FormatTimePipe } from '../format-time.pipe';

describe('TimerComponent', () => {
  let component: TimerComponent;
  let fixture: ComponentFixture<TimerComponent>;
  let timerService: jasmine.SpyObj<TimerService>;
  let taskService: jasmine.SpyObj<TaskService>;
  let stateSubject: BehaviorSubject<TimerState>;

  const initialState: TimerState = {
    timeRemaining: 25 * 60,
    isRunning: false,
    currentPhase: 'Arbeitszeit',
    currentCycle: 1,
    workInterval: 25,
    shortBreak: 5,
    longBreak: 15,
    cycles: 4,
  };

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      priority: 1,
      completed: false,
      inProgress: false,
      timeNeeded: 30,
      duedate: '2025-05-15',
    },
  ];

  beforeEach(async () => {
    stateSubject = new BehaviorSubject<TimerState>(initialState);

    const timerServiceSpy = jasmine.createSpyObj('TimerService', [
      'startTimer',
      'pauseTimer',
      'resetTimer',
      'skipPhase',
      'updateSettings',
    ], {
      state$: stateSubject.asObservable(),
    });

    const taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getTasks',
      'lockTopTask',
    ], {
      lockedTaskId$: new BehaviorSubject<number | null>(null),
      tasks$: of(mockTasks),
    });

    taskServiceSpy.getTasks.and.returnValue(of(mockTasks));

    await TestBed.configureTestingModule({
      imports: [
        TimerComponent,
        RouterTestingModule,
        ReactiveFormsModule,
        CommonModule,
        HeaderComponent,
        NavigationComponent,
        FormatTimePipe,
      ],
      providers: [
        { provide: TimerService, useValue: timerServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimerComponent);
    component = fixture.componentInstance;
    timerService = TestBed.inject(TimerService) as jasmine.SpyObj<TimerService>;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default settings', () => {
    expect(component.settingsForm.value).toEqual({
      workInterval: 25,
      shortBreak: 5,
      longBreak: 15,
      cycles: 4,
    });

    component.state$.subscribe((state) => {
      expect(state.timeRemaining).toBe(25 * 60);
      expect(state.currentPhase).toBe('Arbeitszeit');
      expect(state.currentCycle).toBe(1);
      expect(state.isRunning).toBeFalse();
    });
  });

  it('should toggle timer from stopped to running', () => {
    component.state = { ...initialState, isRunning: false };
    component.toggleTimer();
    expect(timerService.startTimer).toHaveBeenCalled();
  });

  it('should toggle timer from running to paused', () => {
    component.state = { ...initialState, isRunning: true };
    component.toggleTimer();
    expect(timerService.pauseTimer).toHaveBeenCalled();
  });

  it('should reset timer', () => {
    component.resetTimer();
    expect(timerService.resetTimer).toHaveBeenCalled();
  });

  it('should skip phase', () => {
    component.skipPhase();
    expect(timerService.skipPhase).toHaveBeenCalled();
  });

  it('should update settings when form changes', () => {
    const newSettings = {
      workInterval: 30,
      shortBreak: 10,
      longBreak: 20,
      cycles: 3,
    };
    component.settingsForm.setValue(newSettings);
    expect(timerService.updateSettings).toHaveBeenCalledWith(newSettings);
  });

  it('should have form controls with initial values', () => {
    expect(component.settingsForm.get('workInterval')?.value).toBe(25);
    expect(component.settingsForm.get('shortBreak')?.value).toBe(5);
    expect(component.settingsForm.get('longBreak')?.value).toBe(15);
    expect(component.settingsForm.get('cycles')?.value).toBe(4);
  });

  it('should display the correct work interval in the input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const workIntervalInput = compiled.querySelector('input[formControlName="workInterval"]') as HTMLInputElement;
    expect(workIntervalInput.value).toBe('25');
  });

  it('should calculate circle dash offset correctly for half time', () => {
    const state: TimerState = {
      ...initialState,
      timeRemaining: 25 * 30,
      currentPhase: 'Arbeitszeit',
    };
    const dashOffset = component.getCircleDashoffset(state);
    expect(dashOffset).toBeCloseTo(component.circleDasharray / 2);
  });

  it('should calculate circle dash offset correctly for full time', () => {
    const state: TimerState = {
      ...initialState,
      timeRemaining: initialState.workInterval * 60,
      currentPhase: 'Arbeitszeit',
    };
    const dashOffset = component.getCircleDashoffset(state);
    expect(dashOffset).toBe(0);
  });

  it('should calculate circle dash offset correctly for zero time', () => {
    const state: TimerState = {
      ...initialState,
      timeRemaining: 0,
      currentPhase: 'Arbeitszeit',
    };
    const dashOffset = component.getCircleDashoffset(state);
    expect(dashOffset).toBe(component.circleDasharray);
  });

  it('should get cycle array', () => {
    expect(component.getCycleArray(4)).toEqual([1, 2, 3, 4]);
    expect(component.getCycleArray(2)).toEqual([1, 2]);
  });

  it('should lock top task when starting work phase', fakeAsync(() => {
    const runningState: TimerState = {
      ...initialState,
      isRunning: true,
      currentPhase: 'Arbeitszeit',
    };
    stateSubject.next(runningState);
    component.ngOnInit();
    tick();
    expect(taskService.lockTopTask).toHaveBeenCalled();
  }));

  it('should display the correct time', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const timeElement = compiled.querySelector('.time');
    expect(timeElement?.textContent).toContain('25:00');
  });

  it('should display the correct phase', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const phaseElement = compiled.querySelector('.phase');
    expect(phaseElement?.textContent).toBe('Arbeitszeit');
  });

  it('should display the correct number of cycle dots', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cycleDots = compiled.querySelectorAll('.cycle-dot');
    expect(cycleDots.length).toBe(initialState.cycles);
  });

  it('should apply active class to current cycle dot', () => {
    stateSubject.next({ ...initialState, currentCycle: 2 });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cycleDots = compiled.querySelectorAll('.cycle-dot');
    expect(cycleDots[0].classList.contains('completed')).toBeTrue();
    expect(cycleDots[1].classList.contains('active')).toBeTrue();
    expect(cycleDots[2].classList.contains('active')).toBeFalse();
  });

  it('should update cycle dots when cycles change', () => {
    stateSubject.next({ ...initialState, cycles: 3 });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cycleDots = compiled.querySelectorAll('.cycle-dot');
    expect(cycleDots.length).toBe(3);
  });

  it('should show play icon when timer is not running', () => {
    stateSubject.next({ ...initialState, isRunning: false });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const toggleButton = compiled.querySelector('.btn-success');
    expect(toggleButton?.textContent).toContain('▶');
  });

  it('should show pause icon when timer is running', () => {
    stateSubject.next({ ...initialState, isRunning: true });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const toggleButton = compiled.querySelector('.btn-success');
    expect(toggleButton?.textContent).toContain('❚❚');
  });

  it('should call toggleTimer when play/pause button is clicked', () => {
    spyOn(component, 'toggleTimer');
    const compiled = fixture.nativeElement as HTMLElement;
    const toggleButton = compiled.querySelector('.btn-success');
    toggleButton?.dispatchEvent(new Event('click'));
    expect(component.toggleTimer).toHaveBeenCalled();
  });

  it('should display current task when locked', fakeAsync(() => {
    (taskService.lockedTaskId$ as BehaviorSubject<number | null>).next(1);
    
    component.currentTask$.subscribe(task => {
      expect(task).toBeTruthy();
      expect(task?.title).toBe('Task 1');
    });

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const taskTitle = compiled.querySelector('.current-task > span.body-text:nth-child(2)');
    
    expect(taskTitle).toBeTruthy();
    expect(taskTitle?.textContent).toContain('Task 1');
  }));

  it('should get priority label', () => {
    expect(component.getPriorityLabel(1)).toBe('Niedrig');
    expect(component.getPriorityLabel(2)).toBe('Mittel');
    expect(component.getPriorityLabel(3)).toBe('Hoch');
    expect(component.getPriorityLabel(undefined)).toBe('Keine');
  });

  it('should unsubscribe on destroy', () => {
    const subscription = component['stateSubscription'];
    if (subscription) {
      spyOn(subscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(subscription.unsubscribe).toHaveBeenCalled();
    } else {
      fail('stateSubscription is null');
    }
  });
});