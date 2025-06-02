import { Injectable, Injector, Inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, takeWhile, tap, first } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { TimerState } from './timer-state.model';
import { TaskService } from './hello.service';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private stateSubject$ = new BehaviorSubject<TimerState>({
    timeRemaining: 25 * 60,
    isRunning: false,
    currentPhase: 'Arbeitszeit',
    currentCycle: 1,
    workInterval: 25,
    shortBreak: 5,
    longBreak: 15,
    cycles: 4,
  });
  state$ = this.stateSubject$.asObservable();
  private timerRunning = false;
  private timerSubscription: any = null;
  private taskService: TaskService | null = null;

  constructor(
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const initialState = this.loadState();
      this.stateSubject$.next(initialState);

      afterNextRender(() => {
        if (initialState.isRunning) {
          this.startTimer();
        }
      });

      this.state$.subscribe(state => this.saveState(state));
    }
  }

  private getTaskService(): TaskService {
    if (!this.taskService) {
      this.taskService = this.injector.get(TaskService);
    }
    return this.taskService;
  }

  private loadState(): TimerState {
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
    if (isPlatformBrowser(this.platformId)) {
      const savedState = localStorage.getItem('timerState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    }
    return defaultState;
  }

  private saveState(state: TimerState): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('timerState', JSON.stringify(state));
    }
  }

  startTimer() {
    if (!this.timerRunning) {
      this.timerRunning = true;
      const state = this.stateSubject$.value;
      this.stateSubject$.next({ ...state, isRunning: true });
      this.timerSubscription = interval(1000)
        .pipe(
          takeWhile(() => this.timerRunning && this.stateSubject$.value.timeRemaining > 0, true),
          tap(() => {
            const currentState = this.stateSubject$.value;
            this.stateSubject$.next({ ...currentState, timeRemaining: currentState.timeRemaining - 1 });
          })
        )
        .subscribe({
          next: () => {
            if (this.stateSubject$.value.timeRemaining <= 0) {
              this.timerRunning = false;
              this.timerSubscription?.unsubscribe();
              this.timerSubscription = null;
              this.handleCycleEnd();
            }
          },
          error: (error) => console.error('TimerService error:', error),
        });
    }
  }

  pauseTimer() {
    this.timerRunning = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    const state = this.stateSubject$.value;
    this.stateSubject$.next({ ...state, isRunning: false });
  }

  resetTimer() {
    this.pauseTimer();
    const state = this.stateSubject$.value;
    this.stateSubject$.next({
      ...state,
      timeRemaining: state.workInterval * 60,
      currentPhase: 'Arbeitszeit',
      currentCycle: 1,
      isRunning: false,
    });
    this.getTaskService().lockTask(null);
  }

  skipPhase() {
    this.pauseTimer();
    this.nextPhase();
    this.startTimer();
  }

  startBreakManually() {
    const state = this.stateSubject$.value;
    if (state.currentPhase === 'Arbeitszeit' && state.timeRemaining <= 0) {
      this.nextPhase(); // Move to break phase
    }
    this.startTimer(); // Start the break timer, task remains locked
  }

  private handleCycleEnd() {
    const state = this.stateSubject$.value;
    this.stateSubject$.next({
      ...state,
      isRunning: false,
      timeRemaining: 0,
    });
    this.nextPhase(); // Switch to break phase, but don't start or unlock
  }

  private nextPhase() {
    const state = this.stateSubject$.value;
    let newPhase: TimerState['currentPhase'];
    let newTimeRemaining: number;
    let newCycle = state.currentCycle;

    if (state.currentPhase === 'Arbeitszeit') {
      if (state.currentCycle === state.cycles) {
        newPhase = 'Lange Pause';
        newTimeRemaining = state.longBreak * 60;
        newCycle = 1;
      } else {
        newPhase = 'Kurze Pause';
        newTimeRemaining = state.shortBreak * 60;
        newCycle = state.currentCycle + 1;
      }
    } else {
      newPhase = 'Arbeitszeit';
      newTimeRemaining = state.workInterval * 60;
      if (newPhase === 'Arbeitszeit') {
        this.getTaskService().lockTopTask();
      }
    }

    this.stateSubject$.next({
      ...state,
      currentPhase: newPhase,
      timeRemaining: newTimeRemaining,
      currentCycle: newCycle,
      isRunning: false,
    });
  }

  updateSettings(settings: { workInterval?: number; shortBreak?: number; longBreak?: number; cycles?: number }) {
    const state = this.stateSubject$.value;
    const newState = {
      ...state,
      ...settings,
      timeRemaining: settings.workInterval ? settings.workInterval * 60 : state.timeRemaining,
    };
    this.stateSubject$.next(newState);
    this.resetTimer();
  }

  getCycleCount() {
    return this.stateSubject$.value.cycles;
  }
}