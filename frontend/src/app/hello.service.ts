import { Injectable, Injector, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';
import { Task } from './task.model';
import { TimerService } from './timer.service';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;
  private tasksSubject$ = new BehaviorSubject<Task[]>([]);
  tasks$: Observable<Task[]> = this.tasksSubject$.asObservable();
  private lockedTaskIdSubject$ = new BehaviorSubject<number | null>(null);
  lockedTaskId$: Observable<number | null> = this.lockedTaskIdSubject$.asObservable();
  private timerSubscription: Subscription | null = null;
  private timerService: TimerService | null = null;

  constructor(
    private http: HttpClient,
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLockedTaskId();
      this.loadTasks();
      this.initTaskLocking();
    }
  }

  private getTimerService(): TimerService {
    if (!this.timerService) {
      this.timerService = this.injector.get(TimerService);
    }
    return this.timerService;
  }

  private loadLockedTaskId() {
    const lockedTaskId = localStorage.getItem('lockedTaskId');
    if (lockedTaskId) {
      this.lockedTaskIdSubject$.next(Number(lockedTaskId));
    }
  }

  private initTaskLocking() {
    this.timerSubscription = this.getTimerService().state$.pipe(
      distinctUntilChanged((prev, curr) =>
        prev.isRunning === curr.isRunning &&
        prev.currentPhase === curr.currentPhase &&
        prev.currentCycle === curr.currentCycle
      )
    ).subscribe({
      next: state => {
        const lockedTaskId = this.lockedTaskIdSubject$.value;
        if (state.isRunning && state.currentPhase === 'Arbeitszeit' && !lockedTaskId) {
          this.lockTopTask();
        } else if (
          !state.isRunning &&
          state.currentPhase === 'Arbeitszeit' &&
          state.currentCycle === 1 &&
          state.timeRemaining === state.workInterval * 60
        ) {
          this.lockTask(null);
        }
      },
      error: err => console.error('Error in initTaskLocking:', err)
    });
  }

  private sortTasksByPriority(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  loadTasks() {
    this.http.get<Task[]>(`${this.apiUrl}/get`).subscribe({
      next: (tasks) => {
        this.tasksSubject$.next(tasks);
        const lockedTaskIdStr = localStorage.getItem('lockedTaskId');
        if (lockedTaskIdStr) {
          const lockedTaskId = parseInt(lockedTaskIdStr, 10);
          if (!isNaN(lockedTaskId)) {
            const lockedTask = tasks.find(task => task.id === lockedTaskId);
            if (lockedTask) {
              this.lockTask(lockedTaskId);
            } else {
              this.lockTask(null);
              localStorage.removeItem('lockedTaskId');
            }
          }
        }
      },
      error: (error) => {
        console.error('Failed to load tasks. Check if the backend is running at', this.apiUrl, error);
        // Optionally set a fallback state
        this.tasksSubject$.next([]); // Avoid leaving the app in a broken state
      }
    });
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/add`, task).pipe(
      tap(() => this.loadTasks())
    );
  }

  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/edit/${id}`, task).pipe(
      tap(() => this.loadTasks())
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      tap(() => this.loadTasks())
    );
  }

  updateTasksInProgress(sortedTasks: Task[], remainingCycles: number, lockedTaskId: number | null): void {
    const currentTasks = this.tasksSubject$.value;
    const lockedTask = lockedTaskId ? currentTasks.find(t => t.id === lockedTaskId) : null;
    const n = lockedTask ? Math.max(0, remainingCycles - 1) : remainingCycles;
    const topTasks = sortedTasks.slice(0, n);
    const inProgressTasks = lockedTask ? [lockedTask, ...topTasks] : topTasks;
    const updatedTasks = currentTasks.map(task => {
      const inProgress = !task.completed && inProgressTasks.some(t => t.id === task.id);
      return { ...task, inProgress };
    });

    const hasChanges = updatedTasks.some(updatedTask => {
      const originalTask = currentTasks.find(t => t.id === updatedTask.id);
      return originalTask && originalTask.inProgress !== updatedTask.inProgress;
    });

    if (hasChanges) {
      this.tasksSubject$.next(updatedTasks);
      updatedTasks.forEach(task => {
        const originalTask = currentTasks.find(t => t.id === task.id);
        if (originalTask && originalTask.inProgress !== task.inProgress) {
          this.http.post<Task>(`${this.apiUrl}/edit/${task.id}`, task).subscribe({
            error: (error) => console.error(`Failed to update task ${task.id}:`, error)
          });
        }
      });
    }
  }

  lockTask(taskId: number | null): void {
    this.lockedTaskIdSubject$.next(taskId);
    if (isPlatformBrowser(this.platformId)) {
      if (taskId) {
        localStorage.setItem('lockedTaskId', taskId.toString());
      } else {
        localStorage.removeItem('lockedTaskId');
      }
    }
  }

  lockTopTask(): void {
    const tasks = this.tasksSubject$.value;
    const incompleteTasks = tasks.filter(task => !task.completed);
    const sortedTasks = this.sortTasksByPriority(incompleteTasks);
    const topTask = sortedTasks[0];
    if (topTask && !topTask.completed) {
      this.lockTask(topTask.id);
    }
  }

  clearLockedTask(): void {
    this.lockTask(null);
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}