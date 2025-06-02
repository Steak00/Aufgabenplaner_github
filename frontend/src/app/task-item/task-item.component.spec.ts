import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskItemComponent } from './task-item.component';
import { CommonModule } from '@angular/common';
import { TaskService } from '../hello.service';
import { TimerService } from '../timer.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Task } from '../task.model';
import { TimerState } from '../timer-state.model';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let timerService: jasmine.SpyObj<TimerService>;
  let timerStateSubject: BehaviorSubject<TimerState>;

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    priority: 2,
    completed: false,
    inProgress: true,
    timeNeeded: 30,
    duedate: '2025-05-15'
  };

  const getFutureDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  beforeEach(async () => {
    taskService = jasmine.createSpyObj('TaskService', ['updateTask', 'lockTask']);
    timerStateSubject = new BehaviorSubject<TimerState>({
      currentPhase: 'Arbeitszeit',
      timeRemaining: 300,
      isRunning: true,
      currentCycle: 0,
      workInterval: 0,
      shortBreak: 0,
      longBreak: 0,
      cycles: 2
    });
    timerService = jasmine.createSpyObj('TimerService', ['skipPhase', 'startTimer'], {
      state$: timerStateSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [TaskItemComponent, CommonModule],
      providers: [
        { provide: TaskService, useValue: taskService },
        { provide: TimerService, useValue: timerService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;
    component.task = { ...mockTask };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should display task details correctly', () => {
      const task = { ...mockTask, completed: true, duedate: '2025-05-15' };
      component.task = task;
      fixture.detectChanges();

      const row = fixture.nativeElement.querySelector('.table-row');
      expect(row.classList.contains('locked')).toBe(false);

      const checkbox = fixture.nativeElement.querySelector('.checkbox');
      expect(checkbox.classList.contains('completed')).toBe(true);
      expect(checkbox.textContent.trim()).toContain('✓');

      const title = fixture.nativeElement.querySelector('.table-row > div:nth-child(2)');
      expect(title.textContent.trim()).toBe('Test Task');
      expect(title.classList.contains('completed')).toBe(true);

      const priority = fixture.nativeElement.querySelector('.priority');
      expect(priority.textContent).toBe('Mittel');
      expect(priority.classList.contains('priority-medium')).toBe(true);

      const timeNeeded = fixture.nativeElement.querySelector('.table-row > div:nth-child(4)');
      expect(timeNeeded.textContent.trim()).toBe('30 Minuten');

      const dueDate = fixture.nativeElement.querySelector('.duedate');
      const display = component.getDueDateDisplay(task);
      expect(dueDate.textContent).toBe(display.text);
      expect(dueDate.classList.contains(display.color)).toBe(true);

      const status = fixture.nativeElement.querySelector('.status');
      expect(status.textContent).toBe('Erledigt');
      expect(status.classList.contains('status-completed')).toBe(true);
    });
  });

  describe('interactions', () => {
    it('should call toggleCompleted when checkbox is clicked', () => {
      const toggleSpy = spyOn(component, 'toggleCompleted');
      const checkbox = fixture.nativeElement.querySelector('.checkbox');
      checkbox.click();
      expect(toggleSpy).toHaveBeenCalled();
    });

    it('should emit edit event when edit button is clicked', () => {
      const editSpy = spyOn(component.edit, 'emit');
      const editButton = fixture.nativeElement.querySelector('.actions button:first-child');
      editButton.click();
      expect(editSpy).toHaveBeenCalledWith(component.task);
    });

    it('should emit delete event when delete button is clicked', () => {
      const deleteSpy = spyOn(component.delete, 'emit');
      const deleteButton = fixture.nativeElement.querySelector('.actions button:last-child');
      deleteButton.click();
      expect(deleteSpy).toHaveBeenCalledWith(component.task.id);
    });
  });

  describe('getDueDateDisplay', () => {
    it('should return correct display for past due date', () => {
      const pastTask = { ...mockTask, duedate: '2025-05-01' };
      const display = component.getDueDateDisplay(pastTask);
      expect(display.text).toMatch(/-\d+d/);
      expect(display.color).toBe('red');
    });

    it('should return correct display for today', () => {
      const today = new Date().toISOString().split('T')[0];
      const todayTask = { ...mockTask, duedate: today };
      const display = component.getDueDateDisplay(todayTask);
      expect(display.text).toBe('0d');
      expect(display.color).toBe('black');
    });

    it('should return correct display for future due date', () => {
      const futureTask = { ...mockTask, duedate: getFutureDate(7) };
      const display = component.getDueDateDisplay(futureTask);
      expect(display.text).toMatch(/\d+d/);
      expect(display.color).toBe('green');
    });

    it('should handle no due date', () => {
      const noDueTask = { ...mockTask, duedate: '' };
      const display = component.getDueDateDisplay(noDueTask);
      expect(display.text).toBe('-');
      expect(display.color).toBe('black');
    });
  });

  describe('toggleCompleted', () => {
    it('should toggle completed status and emit updated event', () => {
      taskService.updateTask.and.returnValue(of({ ...mockTask, completed: true }));
      const updatedSpy = spyOn(component.updated, 'emit');
      component.toggleCompleted();
      expect(taskService.updateTask).toHaveBeenCalledWith(1, { ...mockTask, completed: true });
      expect(updatedSpy).toHaveBeenCalledWith({ ...mockTask, completed: true });
    });

    it('should skip phase and unlock task when locked and completed during work phase', fakeAsync(() => {
      component.isLocked = true;
      timerStateSubject.next({
        currentPhase: 'Arbeitszeit', timeRemaining: 300, isRunning: true,
        currentCycle: 0,
        workInterval: 0,
        shortBreak: 0,
        longBreak: 0,
        cycles: 2
      });
      taskService.updateTask.and.returnValue(of({ ...mockTask, completed: true }));
      component.toggleCompleted();
      tick();
      expect(timerService.skipPhase).toHaveBeenCalled();
      expect(taskService.lockTask).toHaveBeenCalledWith(null);
    }));

    it('should start timer and unlock task when locked and completed after work phase', fakeAsync(() => {
      component.isLocked = true;
      taskService.updateTask.and.returnValue(of({ ...mockTask, completed: true }));
      timerStateSubject.next({
        currentPhase: 'Kurze Pause', timeRemaining: 0, isRunning: false,
        currentCycle: 0,
        workInterval: 0,
        shortBreak: 0,
        longBreak: 0,
        cycles: 2
      });
      component.toggleCompleted();
      tick();
      expect(timerService.startTimer).toHaveBeenCalled();
      expect(taskService.lockTask).toHaveBeenCalledWith(null);
    }));

    it('should not change timer for non-locked task', () => {
      component.isLocked = false;
      taskService.updateTask.and.returnValue(of({ ...mockTask, completed: true }));
      component.toggleCompleted();
      expect(timerService.skipPhase).not.toHaveBeenCalled();
      expect(timerService.startTimer).not.toHaveBeenCalled();
      expect(taskService.lockTask).not.toHaveBeenCalled();
    });

    it('should not change timer when uncompleting a task', () => {
      component.task = { ...mockTask, completed: true };
      taskService.updateTask.and.returnValue(of({ ...mockTask, completed: false }));
      component.toggleCompleted();
      expect(timerService.skipPhase).not.toHaveBeenCalled();
      expect(timerService.startTimer).not.toHaveBeenCalled();
      expect(taskService.lockTask).not.toHaveBeenCalled();
    });

    it('should handle updateTask error without emitting updated event', () => {
      taskService.updateTask.and.returnValue(throwError(() => new Error('Update failed')));
      const updatedSpy = spyOn(component.updated, 'emit');
      component.toggleCompleted();
      expect(updatedSpy).not.toHaveBeenCalled();
    });
  });

  describe('formatDate', () => {
    it('should format date from YYYY-MM-DD to dd.MM.yyyy', () => {
      expect(component.formatDate('2025-05-15')).toBe('15.05.2025');
    });

    it('should handle invalid date', () => {
      expect(component.formatDate('invalid-date')).toBe('invalid-date');
    });

    it('should handle empty string', () => {
      expect(component.formatDate('')).toBe('');
    });
  });
});