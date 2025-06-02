import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { TimerService } from '../timer.service';
import { TaskService } from '../hello.service';
import { TimerState } from '../timer-state.model';
import { Task } from '../task.model';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { FormatTimePipe } from '../format-time.pipe';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, RouterModule, NavigationComponent, FormatTimePipe],
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css'],
})
export class TimerComponent implements OnInit, OnDestroy {
  state$!: Observable<TimerState>;
  state: TimerState | null = null;
  private stateSubscription: Subscription | null = null;
  settingsForm: FormGroup;
  circleDasharray: number = 565.48; // 2 * π * 90
  currentTask$: Observable<Task | null>;

  constructor(
    private timerService: TimerService,
    private taskService: TaskService,
    private fb: FormBuilder
  ) {
    this.settingsForm = this.fb.group({
      workInterval: [25],
      shortBreak: [5],
      longBreak: [15],
      cycles: [4],
    });

    this.currentTask$ = combineLatest([
      this.taskService.lockedTaskId$,
      this.taskService.getTasks()
    ]).pipe(
      map(([lockedTaskId, tasks]) => tasks.find(task => task.id === lockedTaskId) || null)
    );
  }

  ngOnInit() {
    this.state$ = this.timerService.state$;
    this.stateSubscription = this.state$.subscribe((state) => {
      this.state = state;
      this.settingsForm.patchValue({
        workInterval: state.workInterval,
        shortBreak: state.shortBreak,
        longBreak: state.longBreak,
        cycles: state.cycles,
      }, { emitEvent: false });

      if (state.isRunning && state.currentPhase === 'Arbeitszeit') {
        this.taskService.lockedTaskId$.pipe(first()).subscribe(lockedTaskId => {
          if (!lockedTaskId) {
            this.taskService.lockTopTask();
          }
        });
      }
    });

    this.settingsForm.valueChanges.subscribe((values) => {
      this.timerService.updateSettings(values);
    });
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  toggleTimer() {
    if (this.state?.isRunning) {
      this.timerService.pauseTimer();
    } else {
      this.timerService.startTimer();
    }
  }

  resetTimer() {
    this.timerService.resetTimer();
  }

  skipPhase() {
    this.timerService.skipPhase();
  }

  startPausePhase() {
    this.timerService.skipPhase();
    this.timerService.startTimer();
  }

  getCircleDashoffset(state: TimerState): number {
    const totalTime =
      state.currentPhase === 'Arbeitszeit'
        ? state.workInterval * 60
        : state.currentPhase === 'Kurze Pause'
        ? state.shortBreak * 60
        : state.longBreak * 60;
    const fractionLeft = state.timeRemaining / totalTime;
    return this.circleDasharray * (1 - fractionLeft);
  }

  getCycleArray(cycles: number): number[] {
    return Array.from({ length: cycles }, (_, i) => i + 1);
  }

  getPriorityLabel(priority: number | undefined): string {
    switch (priority) {
      case 1: return 'Niedrig';
      case 2: return 'Mittel';
      case 3: return 'Hoch';
      default: return 'Keine';
    }
  }
}