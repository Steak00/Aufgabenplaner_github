import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { TaskService } from '../hello.service';
import { TimerService } from '../timer.service';
import { AuthGuard } from '../auth.guard';
import { of } from 'rxjs';
import { Task } from '../task.model';
import { TimerState } from '../timer-state.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { FormatSortLabelPipe } from '../format-sort-label.pipe';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let timerService: jasmine.SpyObj<TimerService>;

  const mockTasks: Task[] = [
    { id: 1, title: 'Task 1', description: 'Desc 1', completed: false, inProgress: false, priority: 1, timeNeeded: 30, duedate: '2023-01-01' },
    { id: 2, title: 'Task 2', description: 'Desc 2', completed: true, inProgress: false, priority: 2, timeNeeded: 60, duedate: '2023-01-02' },
    { id: 3, title: 'Task 3', description: 'Desc 3', completed: false, inProgress: true, priority: 3, timeNeeded: 45, duedate: '2023-01-03' }
  ];

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
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'user') {
        return JSON.stringify({ email: 'test@test.com' });
      }
      return null;
    });
    spyOn(localStorage, 'setItem').and.callFake(() => {});
    spyOn(localStorage, 'removeItem').and.callFake(() => {});

    const taskServiceSpy = jasmine.createSpyObj('TaskService', 
      ['getTasks', 'updateTasksInProgress', 'lockTask', 'updateTask', 'deleteTask', 'createTask', 'loadTasks'], 
      {
        tasks$: of(mockTasks),
        lockedTaskId$: of(null)
      }
    );
    
    taskServiceSpy.updateTask.and.returnValue(of(null));
    taskServiceSpy.createTask.and.returnValue(of(null));
    taskServiceSpy.deleteTask.and.returnValue(of(null));

    const timerServiceSpy = jasmine.createSpyObj('TimerService', ['getCycleCount'], {
      state$: of(mockTimerState)
    });

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        CommonModule,
        RouterTestingModule.withRoutes([
          { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }
        ]),
        FormsModule,
        HeaderComponent,
        NavigationComponent,
        TaskItemComponent,
        TaskFormComponent,
        FormatSortLabelPipe
      ],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: TimerService, useValue: timerServiceSpy },
        AuthGuard
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    timerService = TestBed.inject(TimerService) as jasmine.SpyObj<TimerService>;

    taskService.getTasks.and.returnValue(of(mockTasks));
    timerService.getCycleCount.and.returnValue(4);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default sort and Observables', () => {
    expect(component.selectedSort).toBe('priority');
    expect(component.incompleteTasks$).toBeDefined();
    expect(component.completedTasks$).toBeDefined();
    expect(component.lockedTask$).toBeDefined();
  });

  it('should call onSortChange when sort option changes', () => {
    spyOn(component, 'onSortChange');
    const select = fixture.nativeElement.querySelector('.sort-select');
    select.value = 'duedate';
    select.dispatchEvent(new Event('change'));
    expect(component.onSortChange).toHaveBeenCalled();
  });

  it('should update selectedSort on sort change', fakeAsync(() => {
    const select = fixture.nativeElement.querySelector('.sort-select');
    select.value = 'duedate';
    select.dispatchEvent(new Event('change'));
    tick();
    expect(component.selectedSort).toBe('duedate');
  }));

  it('should display tasks correctly', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    const taskItems = fixture.debugElement.queryAll(By.css('app-task-item'));
    expect(taskItems.length).toBe(mockTasks.length);
  }));

  it('should open add modal when button is clicked', () => {
    const button = fixture.nativeElement.querySelector('.btn-primary');
    button.click();
    expect(component.showModal).toBeTrue();
    expect(component.isEditing).toBeFalse();
    expect(component.selectedTask).toBeNull();
  });

  it('should open edit modal when edit is emitted from task item', () => {
    const taskItem = fixture.debugElement.query(By.css('app-task-item')).componentInstance as TaskItemComponent;
    const task = mockTasks[0];
    taskItem.edit.emit(task);
    expect(component.showModal).toBeTrue();
    expect(component.isEditing).toBeTrue();
    expect(component.selectedTask).toEqual(task);
  });

  it('should close modal when close is emitted from task form', () => {
    component.showModal = true;
    fixture.detectChanges();
    const taskForm = fixture.debugElement.query(By.css('app-task-form')).componentInstance as TaskFormComponent;
    taskForm.close.emit();
    expect(component.showModal).toBeFalse();
  });

  it('should call taskService.updateTask when saving an edited task', () => {
    component.isEditing = true;
    component.selectedTask = mockTasks[0];
    component.showModal = true;
    const updatedTask = { ...mockTasks[0], title: 'Updated Task' };
    component.onSaveTask(updatedTask);
    expect(taskService.updateTask).toHaveBeenCalledWith(updatedTask.id, updatedTask);
  });

  it('should call taskService.createTask when saving a new task', () => {
    component.isEditing = false;
    component.showModal = true;
    const newTask = { id: 4, title: 'New Task', description: 'New Desc', completed: false, inProgress: false, priority: 1, timeNeeded: 30, duedate: '2023-01-04' };
    component.onSaveTask(newTask);
    expect(taskService.createTask).toHaveBeenCalledWith(newTask);
  });

  it('should call taskService.deleteTask when delete is emitted from task item', () => {
    const taskItem = fixture.debugElement.query(By.css('app-task-item')).componentInstance as TaskItemComponent;
    const taskId = mockTasks[0].id;
    taskItem.delete.emit(taskId);
    expect(taskService.deleteTask).toHaveBeenCalledWith(taskId);
  });

  it('should update totalTasks and completedTasks', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.totalTasks).toBe(mockTasks.length);
    expect(component.completedTasks).toBe(mockTasks.filter(t => t.completed).length);
  }));
});