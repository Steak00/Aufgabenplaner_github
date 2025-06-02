import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TimerService } from './timer.service';
import { TimerState } from './timer-state.model';
import { TaskService } from './hello.service';
import { PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Task } from './task.model';
import { isPlatformBrowser } from '@angular/common';

class MockTaskService {
  lockTask = jasmine.createSpy('lockTask');
  lockTopTask = jasmine.createSpy('lockTopTask');
  lockedTask$ = new BehaviorSubject<number | null>(null);
  getTasks(): Observable<Task[]> {
    return new BehaviorSubject<Task[]>([]);
  }
}

const localStorageMock: Storage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

describe('TimerService', () => {
  let service: TimerService;
  let taskService: MockTaskService;

  const defaultState: TimerState = {
    timeRemaining: 25 * 60,
    isRunning: false,
    currentPhase: 'Arbeitszeit',
    currentCycle: 1,
    workInterval: 25,
    shortBreak: 5,
    longBreak: 15,
    cycles: 4,
  };

  beforeEach(() => {
    spyOn(localStorageMock, 'getItem').and.callThrough();
    spyOn(localStorageMock, 'setItem').and.callThrough();
    spyOn(localStorageMock, 'removeItem').and.callThrough();

    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
    });

    TestBed.configureTestingModule({
        providers: [
            TimerService,
            { provide: TaskService, useClass: MockTaskService },
            { provide: PLATFORM_ID, useValue: 'browser' },
        ],
    });

    service = TestBed.inject(TimerService);
    taskService = TestBed.inject(TaskService) as unknown as MockTaskService;
});

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default state in browser environment', async () => {
    const state = await firstValueFrom(service.state$);
    expect(state).toEqual(defaultState);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('timerState');
  });

  it('should load saved state from localStorage in browser environment', async () => {
    const savedState: TimerState = {
      ...defaultState,
      timeRemaining: 10 * 60,
      currentPhase: 'Kurze Pause',
      currentCycle: 2,
    };
    localStorageMock.setItem('timerState', JSON.stringify(savedState));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        TimerService,
        { provide: TaskService, useClass: MockTaskService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(TimerService);

    const state = await firstValueFrom(service.state$);
    expect(state).toEqual(savedState);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('timerState');
  });

  it('should use default state in server environment', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
          providers: [
              TimerService,
              { provide: TaskService, useClass: MockTaskService },
              { provide: PLATFORM_ID, useValue: 'server' },
          ],
      });

      (localStorageMock.getItem as jasmine.Spy).calls.reset();
      (localStorageMock.setItem as jasmine.Spy).calls.reset();
      (localStorageMock.removeItem as jasmine.Spy).calls.reset();

      service = TestBed.inject(TimerService);

      const platformId = TestBed.inject(PLATFORM_ID);
      expect(platformId).toBe('server');
      expect(isPlatformBrowser(platformId)).toBeFalse();

      const state = await firstValueFrom(service.state$);
      expect(state).toEqual(defaultState);

      expect(localStorageMock.getItem).not.toHaveBeenCalled();
  });

  it('should start the timer and decrease timeRemaining', fakeAsync(async () => {
    service.startTimer();
    let state = await firstValueFrom(service.state$);

    expect(state.isRunning).toBeTrue();
    expect(state.timeRemaining).toBe(25 * 60);

    tick(1000);
    state = await firstValueFrom(service.state$);
    expect(state.timeRemaining).toBe(25 * 60 - 1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('timerState', jasmine.any(String));
  }));

  it('should not start the timer if already running', fakeAsync(async () => {
      service.startTimer();
      tick(1000);
      let state = await firstValueFrom(service.state$);
      const initialTime = state.timeRemaining;

      service.startTimer();
      tick(1000);
      state = await firstValueFrom(service.state$);
      expect(state.timeRemaining).toBe(initialTime - 1);
  }));

  it('should pause the timer', fakeAsync(async () => {
      service.startTimer();
      tick(1000);
      let state = await firstValueFrom(service.state$);
      const timeAfterStart = state.timeRemaining;

      service.pauseTimer();
      tick(1000);
      state = await firstValueFrom(service.state$);
      expect(state.isRunning).toBeFalse();
      expect(state.timeRemaining).toBe(timeAfterStart);
  }));

  it('should reset the timer', fakeAsync(async () => {
    service.startTimer();
    tick(1000);
    service.resetTimer();

    const state = await firstValueFrom(service.state$);
    expect(state.timeRemaining).toBe(25 * 60);
    expect(state.isRunning).toBeFalse();
    expect(state.currentPhase).toBe('Arbeitszeit');
    expect(state.currentCycle).toBe(1);
    expect(taskService.lockTask).toHaveBeenCalledWith(null);
  }));

  it('should skip to the next phase (Arbeitszeit -> Kurze Pause)', fakeAsync(async () => {
    service.skipPhase();
    const state = await firstValueFrom(service.state$);

    expect(state.currentPhase).toBe('Kurze Pause');
    expect(state.timeRemaining).toBe(5 * 60);
    expect(state.currentCycle).toBe(2);
    expect(state.isRunning).toBeTrue();
  }));

  it('should skip to Arbeitszeit from Kurze Pause', fakeAsync(async () => {
    (service as any).stateSubject$.next({
      ...defaultState,
      currentPhase: 'Kurze Pause',
      currentCycle: 2,
      timeRemaining: 5 * 60,
    });
    service.skipPhase();

    const state = await firstValueFrom(service.state$);
    expect(state.currentPhase).toBe('Arbeitszeit');
    expect(state.timeRemaining).toBe(25 * 60);
    expect(state.currentCycle).toBe(2);
    expect(state.isRunning).toBeTrue();
    expect(taskService.lockTopTask).toHaveBeenCalled();
  }));

  it('should go to long break after completing all cycles', fakeAsync(async () => {
    (service as any).stateSubject$.next({
      ...defaultState,
      currentPhase: 'Arbeitszeit',
      currentCycle: 4,
      timeRemaining: 25 * 60,
    });

    service.skipPhase();
    const state = await firstValueFrom(service.state$);
    expect(state.currentPhase).toBe('Lange Pause');
    expect(state.timeRemaining).toBe(15 * 60);
    expect(state.currentCycle).toBe(1);
    expect(state.isRunning).toBeTrue();
  }));

  it('should handle cycle end when timeRemaining reaches 0', fakeAsync(async () => {
    (service as any).stateSubject$.next({
      ...defaultState,
      timeRemaining: 1,
      isRunning: true,
    });

    service.startTimer();
    tick(1000);

    const state = await firstValueFrom(service.state$);
    expect(state.currentPhase).toBe('Kurze Pause');
    expect(state.timeRemaining).toBe(5 * 60);
    expect(state.currentCycle).toBe(2);
    expect(state.isRunning).toBeFalse();
  }));

  it('should start break manually after work phase ends', fakeAsync(async () => {
    (service as any).stateSubject$.next({
      ...defaultState,
      timeRemaining: 0,
      currentPhase: 'Arbeitszeit',
      isRunning: false,
    });

    service.startBreakManually();
    const state = await firstValueFrom(service.state$);
    expect(state.currentPhase).toBe('Kurze Pause');
    expect(state.timeRemaining).toBe(5 * 60);
    expect(state.currentCycle).toBe(2);
    expect(state.isRunning).toBeTrue();
  }));

  it('should not change phase if startBreakManually called during break', fakeAsync(async () => {
    (service as any).stateSubject$.next({
      ...defaultState,
      currentPhase: 'Kurze Pause',
      timeRemaining: 5 * 60,
      isRunning: false,
    });

    service.startBreakManually();
    const state = await firstValueFrom(service.state$);
    expect(state.currentPhase).toBe('Kurze Pause');
    expect(state.timeRemaining).toBe(5 * 60);
    expect(state.isRunning).toBeTrue();
  }));

  it('should update settings and reset timer', fakeAsync(async () => {
    service.updateSettings({
      workInterval: 30,
      shortBreak: 10,
      longBreak: 20,
      cycles: 3,
    });

    const state = await firstValueFrom(service.state$);
    expect(state.workInterval).toBe(30);
    expect(state.shortBreak).toBe(10);
    expect(state.longBreak).toBe(20);
    expect(state.cycles).toBe(3);
    expect(state.timeRemaining).toBe(30 * 60);
    expect(state.currentPhase).toBe('Arbeitszeit');
    expect(state.currentCycle).toBe(1);
    expect(state.isRunning).toBeFalse();
    expect(taskService.lockTask).toHaveBeenCalledWith(null);
  }));

  it('should handle invalid settings gracefully', fakeAsync(async () => {
    service.updateSettings({
      workInterval: -1,
      shortBreak: 0,
      longBreak: -10,
      cycles: 0,
    });

    const state = await firstValueFrom(service.state$);
    expect(state.workInterval).toBe(-1);
    expect(state.shortBreak).toBe(0);
    expect(state.longBreak).toBe(-10);
    expect(state.cycles).toBe(0);
    expect(state.timeRemaining).toBe(-1 * 60);
  }));

  it('should return cycle count', async () => {
    expect(service.getCycleCount()).toBe(4);
    service.updateSettings({ cycles: 5 });
    const state = await firstValueFrom(service.state$);
    expect(state.cycles).toBe(5);
    expect(service.getCycleCount()).toBe(5);
  });

  it('should save state to localStorage on state change', fakeAsync(async () => {
    service.startTimer();
    tick(1000);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('timerState', jasmine.any(String));
    const savedState = JSON.parse((localStorageMock.setItem as jasmine.Spy).calls.mostRecent().args[1]);
    expect(savedState.timeRemaining).toBe(25 * 60 - 1);
    expect(savedState.isRunning).toBeTrue();
  }));
});