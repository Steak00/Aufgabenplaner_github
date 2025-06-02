import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, Subscription, of } from 'rxjs';
import { map, distinctUntilChanged, debounceTime, catchError, first } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskService } from '../hello.service';
import { TimerService } from '../timer.service';
import { Task } from '../task.model';
import { TimerState } from '../timer-state.model';
import { FormatSortLabelPipe } from '../format-sort-label.pipe';

interface DashboardComponentInterface {
  selectedSort: string;
  onSortChange(event: Event): void;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    NavigationComponent,
    TaskItemComponent,
    TaskFormComponent,
    FormatSortLabelPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy, DashboardComponentInterface {
  private tasksSubject$ = new BehaviorSubject<Task[]>([]);
  tasks$: Observable<Task[]> = this.tasksSubject$.asObservable();
  incompleteTasks$!: Observable<Task[]>;
  completedTasks$!: Observable<Task[]>;
  lockedTask$!: Observable<Task | null>;
  state$!: Observable<TimerState>;
  state: TimerState | null = null;
  private stateSubscription: Subscription | null = null;
  private taskSubscription: Subscription | null = null;
  public selectedSort: string = 'priority';
  private formValues$ = new BehaviorSubject<string>(this.selectedSort);
  showModal = false;
  isEditing = false;
  selectedTask: Task | null = null;
  totalTasks = 0;
  completedTasks = 0;

  constructor(
    private taskService: TaskService,
    private timerService: TimerService
  ) {}

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.selectedSort = target.value;
      this.formValues$.next(target.value);
      localStorage.setItem('dashboardSort', target.value);
    }
  }

  ngOnInit() {
    const savedSort = localStorage.getItem('dashboardSort');
    if (savedSort) {
      this.selectedSort = savedSort;
      this.formValues$.next(savedSort);
    }

    this.state$ = this.timerService.state$;
    this.lockedTask$ = combineLatest([this.taskService.lockedTaskId$, this.taskService.getTasks()]).pipe(
      map(([id, tasks]) => tasks.find(task => task.id === id) || null),
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id), // Only emit if the locked task ID changes
      catchError(err => of(null))
    );

    this.lockedTask$.subscribe(lockedTask => {
      if (lockedTask) {
        //console.log('Locked task on dashboard:', lockedTask);
        // Ensure UI reflects the locked task (e.g., exclude from sortable list)
      }
    });

    // Load tasks and other initialization logic...
    this.taskService.loadTasks();

    this.state$.pipe(
      distinctUntilChanged((prev, curr) => prev.currentCycle === curr.currentCycle && prev.cycles === curr.cycles),
      debounceTime(100)
    ).subscribe({
      next: state => {
        this.state = state;
      },
      error: err => {}
    });

    this.taskSubscription = this.taskService.getTasks().pipe(
      debounceTime(100),
      catchError(err => of([]))
    ).subscribe({
      next: (tasks: Task[]) => this.loadTasks(tasks),
      error: (error: unknown) => {}
    });

    this.setupFilters();

    // Subscribe to incompleteTasks$ to update "In Arbeit"
    this.incompleteTasks$.pipe(
      debounceTime(3) // Wait to batch rapid changes (300ms worked fine, but seems slow)
    ).subscribe(incompleteTasks => {
      if (this.state) {
        const remainingCycles = Math.max(0, this.state.cycles - this.state.currentCycle + 1);
        this.lockedTask$.pipe(first()).subscribe(lockedTask => {
          const lockedTaskId = lockedTask ? lockedTask.id : null;
          this.taskService.updateTasksInProgress(incompleteTasks, remainingCycles, lockedTaskId);
        });
      }
    });

    combineLatest([this.incompleteTasks$, this.completedTasks$]).pipe(
      catchError(err => of([[], []]))
    ).subscribe(([incompleteTasks, completedTasks]) => {
      this.totalTasks = (incompleteTasks || []).length + (completedTasks || []).length;
      this.completedTasks = (completedTasks || []).length;
    });
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    if (this.taskSubscription) {
      this.taskSubscription.unsubscribe();
    }
  }

  loadTasks(tasks: Task[]) {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((task) => {
      const taskDate = task.duedate ? new Date(task.duedate).toISOString().split('T')[0] : today;
      return taskDate <= today;
    });
    this.tasksSubject$.next(todayTasks || []);
  }

  updateTasksInProgress() {
    const cycleCount = this.timerService.getCycleCount();
    const currentCycle = this.state?.currentCycle || 1;
    combineLatest([this.incompleteTasks$, this.lockedTask$]).pipe(
      catchError(err => {
        return of([[], null]);
      })
    ).subscribe(([incompleteTasks, lockedTask]) => {
      const tasksToUpdate = [...(incompleteTasks || [])];
      if (lockedTask && !(lockedTask instanceof Array)) {
        tasksToUpdate.push(lockedTask);
      }
      this.taskService.updateTasksInProgress(tasksToUpdate, cycleCount, currentCycle);
    });
  }

  setupFilters() {
    this.incompleteTasks$ = combineLatest([this.tasks$, this.formValues$, this.lockedTask$, this.state$]).pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      map(([tasks, selectedSort, lockedTask, state]) => {
        let incompleteTasks = tasks.filter(task => !task.completed && task.id !== (lockedTask?.id || null));
        return this.applySort(incompleteTasks);
      }),
      catchError(err => of([]))
    );

    this.completedTasks$ = this.tasks$.pipe(
      map(tasks => tasks.filter(task => task.completed)),
      catchError(err => of([]))
    );
  }

  private applySort(tasks: Task[]): Task[] {
    const sortByPriority = (a: Task, b: Task) => (b.priority ?? 0) - (a.priority ?? 0);
    const sortByStatus = (a: Task, b: Task) => this.getStatusPriority(a) - this.getStatusPriority(b);
    const sortByDueDate = (a: Task, b: Task) => {
      const dateA = a.duedate ? new Date(a.duedate).getTime() : Infinity;
      const dateB = b.duedate ? new Date(b.duedate).getTime() : Infinity;
      return dateA - dateB;
    };
    const sortByDurationShort = (a: Task, b: Task) => (a.timeNeeded ?? Infinity) - (b.timeNeeded ?? Infinity);
    const sortByDurationLong = (a: Task, b: Task) => (b.timeNeeded ?? -Infinity) - (a.timeNeeded ?? -Infinity);

    let sortedTasks = [...tasks];
    if (this.selectedSort === 'priority') {
      sortedTasks.sort(sortByPriority);
    } else if (this.selectedSort === 'status') {
      sortedTasks.sort(sortByStatus);
    } else if (this.selectedSort === 'duedate') {
      sortedTasks.sort(sortByDueDate);
    } else if (this.selectedSort === 'duration-short') {
      sortedTasks.sort(sortByDurationShort);
    } else if (this.selectedSort === 'duration-long') {
      sortedTasks.sort(sortByDurationLong);
    }

    return sortedTasks;
  }

  openAddModal() {
    this.isEditing = false;
    this.selectedTask = null;
    this.showModal = true;
  }

  openEditModal(task: Task) {
    this.isEditing = true;
    this.selectedTask = { ...task };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onSaveTask(task: Task) {
    if (this.isEditing) {
      this.taskService.updateTask(task.id, task).subscribe({
        next: () => this.closeModal(),
        error: (error: any) => {}
      });
    } else {
      this.taskService.createTask(task).subscribe({
        next: () => this.closeModal(),
        error: (error: any) => {}
      });
    }
  }

  deleteTask(id: number) {
    this.lockedTask$.pipe(
      map(lockedTask => lockedTask?.id === id)
    ).subscribe(isLocked => {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          if (isLocked) {
            this.taskService.lockTask(null);
          }
          const currentTasks = this.tasksSubject$.value;
          const updatedTasks = currentTasks.filter((task: Task) => task.id !== id);
          this.tasksSubject$.next(updatedTasks);
        },
        error: (error: any) => {}
      });
    });
  }

  updateTask(updatedTask: Task) {
    this.lockedTask$.pipe(
      map(lockedTask => lockedTask?.id === updatedTask.id)
    ).subscribe(isLocked => {
      if (updatedTask.completed && isLocked) {
        this.taskService.lockTask(null);
      }
      this.taskService.updateTask(updatedTask.id, updatedTask).subscribe({
        next: () => {
          const currentTasks = this.tasksSubject$.value;
          const index = currentTasks.findIndex((task: Task) => task.id === updatedTask.id);
          if (index !== -1) {
            currentTasks[index] = updatedTask;
            this.tasksSubject$.next([...currentTasks]);
          }
        },
        error: (error: any) => {}
      });
    });
  }

  getStatus(task: Task): string {
    if (task.completed) return 'Erledigt';
    if (task.inProgress) return 'In Arbeit';
    return 'Offen';
  }

  getStatusPriority(task: Task): number {
    if (task.completed) return 3;
    if (task.inProgress) return 1;
    return 2;
  }
}