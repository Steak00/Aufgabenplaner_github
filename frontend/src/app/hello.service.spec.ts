import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './hello.service';
import { TimerService } from './timer.service';
import { Task } from './task.model';
import { BehaviorSubject } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../environments/environment';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  let timerServiceMock: Partial<TimerService>;
  let stateSubject$: BehaviorSubject<any>;
  const mockApiUrl = `${environment.apiUrl}/tasks`;

  const mockTasks: Task[] = [
    { id: 1, title: 'Task 1', description: '', completed: false, inProgress: false, priority: 2, timeNeeded: 30, duedate: '2025-05-30' },
    { id: 2, title: 'Task 2', description: '', completed: true, inProgress: false, priority: 1, timeNeeded: 15, duedate: '2025-05-31' },
  ];

  beforeEach(() => {
    stateSubject$ = new BehaviorSubject({
      isRunning: false,
      currentPhase: 'Arbeitszeit',
      currentCycle: 1,
      workInterval: 25,
      timeRemaining: 1500,
      shortBreak: 5,
      longBreak: 15,
      cycles: 4,
    });

    timerServiceMock = {
      state$: stateSubject$.asObservable(),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TaskService,
        { provide: TimerService, useValue: timerServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);

    spyOn(localStorage, 'getItem').and.callFake((key: string) => null);
    spyOn(localStorage, 'setItem').and.callFake(() => {});
    spyOn(localStorage, 'removeItem').and.callFake(() => {});

    const initialReq = httpMock.expectOne(`${mockApiUrl}/get`);
    initialReq.flush(mockTasks);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadTasks', () => {
    it('should load tasks from the API and update tasksSubject$', () => {
      service.loadTasks();

      const req = httpMock.expectOne(`${mockApiUrl}/get`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);

      service.getTasks().subscribe((tasks) => {
        expect(tasks).toEqual(mockTasks);
      });
    });

    it('should handle locked task from localStorage', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('1');
      service.loadTasks();

      const req = httpMock.expectOne(`${mockApiUrl}/get`);
      req.flush(mockTasks);

      service.lockedTaskId$.subscribe((lockedTaskId) => {
        expect(lockedTaskId).toBe(1);
        expect(localStorage.setItem).toHaveBeenCalledWith('lockedTaskId', '1');
      });
    });

    it('should clear invalid locked task from localStorage', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('999');
      service.loadTasks();

      const req = httpMock.expectOne(`${mockApiUrl}/get`);
      req.flush(mockTasks);

      service.lockedTaskId$.subscribe((lockedTaskId) => {
        expect(lockedTaskId).toBeNull();
        expect(localStorage.removeItem).toHaveBeenCalledWith('lockedTaskId');
      });
    });

    it('should handle API error and set empty tasks array', () => {
      service.loadTasks();

      const req = httpMock.expectOne(`${mockApiUrl}/get`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      service.getTasks().subscribe((tasks) => {
        expect(tasks).toEqual([]);
      });
    });
  });

  describe('createTask', () => {
    it('should create a task and reload tasks', () => {
      const newTask: Task = {
        id: 3,
        title: 'New Task',
        description: '',
        completed: false,
        inProgress: false,
        priority: 3,
        timeNeeded: 20,
        duedate: '2025-06-01',
      };

      service.createTask(newTask).subscribe((task) => {
        expect(task).toEqual(newTask);
      });

      const createReq = httpMock.expectOne(`${mockApiUrl}/add`);
      expect(createReq.request.method).toBe('POST');
      createReq.flush(newTask);

      const loadReq = httpMock.expectOne(`${mockApiUrl}/get`);
      loadReq.flush(mockTasks);
    });
  });

  describe('updateTask', () => {
    it('should update a task and reload tasks', () => {
      const updatedTask: Task = { ...mockTasks[0], title: 'Updated Task' };

      service.updateTask(updatedTask.id, updatedTask).subscribe((task) => {
        expect(task).toEqual(updatedTask);
      });

      const updateReq = httpMock.expectOne(`${mockApiUrl}/edit/${updatedTask.id}`);
      expect(updateReq.request.method).toBe('POST');
      updateReq.flush(updatedTask);

      const loadReq = httpMock.expectOne(`${mockApiUrl}/get`);
      loadReq.flush(mockTasks);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task and reload tasks', () => {
      service.deleteTask(1).subscribe(() => {
        expect(true).toBe(true);
      });

      const deleteReq = httpMock.expectOne(`${mockApiUrl}/delete/1`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush(null);

      const loadReq = httpMock.expectOne(`${mockApiUrl}/get`);
      loadReq.flush(mockTasks);
    });
  });

  describe('lockTask', () => {
    it('should lock a task and update localStorage', () => {
      service.lockTask(1);

      service.lockedTaskId$.subscribe((lockedTaskId) => {
        expect(lockedTaskId).toBe(1);
        expect(localStorage.setItem).toHaveBeenCalledWith('lockedTaskId', '1');
      });
    });

    it('should unlock a task and clear localStorage', () => {
      service.lockTask(null);

      service.lockedTaskId$.subscribe((lockedTaskId) => {
        expect(lockedTaskId).toBeNull();
        expect(localStorage.removeItem).toHaveBeenCalledWith('lockedTaskId');
      });
    });
  });

  describe('lockTopTask', () => {
    it('should lock the highest priority incomplete task', () => {
      service['tasksSubject$'].next(mockTasks);
      service.lockTopTask();

      service.lockedTaskId$.subscribe((lockedTaskId) => {
        expect(lockedTaskId).toBe(1);
        expect(localStorage.setItem).toHaveBeenCalledWith('lockedTaskId', '1');
      });
    });

    it('should not lock any task if all tasks are completed', () => {
      const completedTasks = mockTasks.map((task) => ({ ...task, completed: true }));
      service['tasksSubject$'].next(completedTasks);
      service.lockTopTask();

      service.lockedTaskId$.subscribe((lockedTaskId) => {
        expect(lockedTaskId).toBeNull();
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });
    });
  });

  describe('updateTasksInProgress', () => {
    it('should update inProgress status for tasks based on remaining cycles', () => {
      service['tasksSubject$'].next(mockTasks);
      const sortedTasks = [mockTasks[0]];
      service.updateTasksInProgress(sortedTasks, 1, null);

      service.getTasks().subscribe((tasks) => {
        expect(tasks[0].inProgress).toBe(true);
        expect(tasks[1].inProgress).toBe(false);
      });

      const updateReq = httpMock.expectOne(`${mockApiUrl}/edit/1`);
      expect(updateReq.request.method).toBe('POST');
      updateReq.flush(mockTasks[0]);
    });

    it('should include locked task in inProgress tasks', () => {
      service['tasksSubject$'].next(mockTasks);
      service.lockTask(1);
      const sortedTasks = [mockTasks[0]];
      service.updateTasksInProgress(sortedTasks, 1, 1);

      service.getTasks().subscribe((tasks) => {
        expect(tasks[0].inProgress).toBe(true);
        expect(tasks[1].inProgress).toBe(false);
      });

      const updateReq = httpMock.expectOne(`${mockApiUrl}/edit/1`);
      updateReq.flush(mockTasks[0]);
    });
  });

  describe('initTaskLocking', () => {
    it('should lock top task when timer starts in work phase', () => {
      service['tasksSubject$'].next(mockTasks);
      stateSubject$.next({
        isRunning: true,
        currentPhase: 'Arbeitszeit',
        currentCycle: 1,
        workInterval: 25,
        timeRemaining: 1500,
        shortBreak: 5,
        longBreak: 15,
        cycles: 4,
      });

      service.lockedTaskId$.subscribe((lockedTaskId) => {
        expect(lockedTaskId).toBe(1);
        expect(localStorage.setItem).toHaveBeenCalledWith('lockedTaskId', '1');
      });
    });

  describe('initTaskLocking', () => {
    it('should unlock task when timer stops in initial work phase', fakeAsync(() => {
      service['tasksSubject$'].next(mockTasks);
      service.lockTask(1);

      stateSubject$.next({
        isRunning: true,
        currentPhase: 'Arbeitszeit',
        currentCycle: 1,
        workInterval: 25,
        timeRemaining: 1500,
        shortBreak: 5,
        longBreak: 15,
        cycles: 4,
      });
      tick();

      stateSubject$.next({
        isRunning: false,
        currentPhase: 'Arbeitszeit',
        currentCycle: 1,
        workInterval: 25,
        timeRemaining: 25 * 60,
        shortBreak: 5,
        longBreak: 15,
        cycles: 4,
      });
      tick();

      service.lockedTaskId$.subscribe((lockedTaskId) => {
        expect(lockedTaskId).toBeNull();
        expect(localStorage.removeItem).toHaveBeenCalledWith('lockedTaskId');
      });
    }));
  });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from timerSubscription', () => {
      const unsubscribeSpy = spyOn(service['timerSubscription']!, 'unsubscribe').and.callThrough();
      service.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});