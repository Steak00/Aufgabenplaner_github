import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TimerService } from '../timer.service';
import { TaskService } from '../hello.service';
import { TimerState } from '../timer-state.model';
import { Observable } from 'rxjs';
import { FormatTimePipe } from '../format-time.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormatTimePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  subtitle: string | null = null;
  state$!: Observable<TimerState>;
  state: TimerState | null = null;
  private stateSubscription: Subscription | null = null;
  showTimer: boolean = false;
  circleDasharray: number = 169.65; // 2 * π * 27

  constructor(
    private router: Router,
    private timerService: TimerService,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.state$ = this.timerService.state$;
    this.stateSubscription = this.state$.subscribe((state) => {
      this.state = state;
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: any) => {
      this.setSubtitle(event.urlAfterRedirects);
      this.setShowTimer(event.urlAfterRedirects);
    });

    this.setSubtitle(this.router.url);
    this.setShowTimer(this.router.url);
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  setSubtitle(url: string) {
    switch (url) {
      case '/dashboard':
        this.subtitle = '/ Erfolg in Aussicht';
        break;
      case '/tasks-list':
        this.subtitle = '/ Aufgabenverwaltung';
        break;
      case '/timer':
        this.subtitle = '/ Pomodoro Timer';
        break;
      case '/evaluation':
        this.subtitle = '/ Auswertungen';
        break;
      case '/settings':
        this.subtitle = '/ Einstellungen';
        break;
      default:
        this.subtitle = null;
    }
  }

  setShowTimer(url: string) {
    this.showTimer = url !== '/timer';
  }

  toggleTimer() {
    if (this.state?.isRunning) {
      this.timerService.pauseTimer();
    } else {
      this.timerService.startTimer();
    }
  }

  getCircleDashoffset(state: TimerState): number {
    const totalTime =
      state.currentPhase === 'Arbeitszeit'
        ? state.workInterval * 60
        : state.currentPhase === 'Kurze Pause'
        ? state.shortBreak * 60
        : state.longBreak * 60;
    const fractionRemaining = state.timeRemaining / totalTime;
    return this.circleDasharray * (1 - fractionRemaining);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.timerService.resetTimer();
    this.taskService.clearLockedTask();
    this.router.navigate(['/login']);
  }
}