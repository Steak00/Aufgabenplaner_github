import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TasksListComponent } from './tasks-list.component';
import { TaskService } from '../hello.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskItemComponent } from '../task-item/task-item.component';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { Task } from '../task.model';

describe('TasksListComponent', () => {
  let component: TasksListComponent;
  let fixture: ComponentFixture<TasksListComponent>;
  let taskService: jasmine.SpyObj<TaskService>;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task One',
      description: 'Description One',
      priority: 1,
      completed: false,
      inProgress: false,
      timeNeeded: 30,
      duedate: '2025-10-15'
    },
    {
      id: 2,
      title: 'Task Two',
      description: 'Description Two',
      priority: 2,
      completed: true,
      inProgress: false,
      timeNeeded: 45,
      duedate: '2025-10-16'
    }
  ];

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getTasks',
      'createTask',
      'updateTask',
      'deleteTask'
    ]);
    taskServiceSpy.getTasks.and.returnValue(of(mockTasks));

    await TestBed.configureTestingModule({
      imports: [
        TasksListComponent,
        TaskFormComponent,
        TaskItemComponent,
        HeaderComponent,
        NavigationComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        CommonModule
      ],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TasksListComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(taskService.getTasks).toHaveBeenCalled();
    component.tasks$.subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks[0].duedate).toBe('2025-10-15');
    });
  }));

  it('should filter tasks by search term', fakeAsync(() => {
    component.filterForm.patchValue({
      searchTerm: 'Task One',
      selectedStatus: '',
      selectedPriority: ''
    });
    fixture.detectChanges();
    component.setupFilters();
    tick(100);
    component.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('Task One');
    });
  }));

  it('should filter tasks by status', fakeAsync(() => {
    component.filterForm.patchValue({
      searchTerm: '',
      selectedStatus: 'Erledigt',
      selectedPriority: ''
    });
    fixture.detectChanges();
    component.setupFilters();
    tick(100);
    component.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].completed).toBeTrue();
    });
  }));

  it('should filter tasks by priority', fakeAsync(() => {
    component.filterForm.patchValue({
      searchTerm: '',
      selectedStatus: '',
      selectedPriority: '2'
    });
    fixture.detectChanges();
    component.setupFilters();
    tick(100);
    component.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].priority).toBe(2);
    });
  }));

  it('should handle pagination', fakeAsync(() => {
    const largeTaskList = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      title: `Task ${i + 1}`,
      description: `Description ${i + 1}`,
      priority: 1,
      completed: false,
      inProgress: false,
      timeNeeded: 30,
      duedate: '2025-10-15'
    }));
    taskService.getTasks.and.returnValue(of(largeTaskList));
    component.ngOnInit();
    component.setupFilters();
    tick(100);

    component.currentPage$.next(2);
    component.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(5);
      expect(tasks[0].id).toBe(11);
    });

    expect(component.totalPages$.value).toBe(2);
    expect(component.getPages()).toEqual([1, 2]);
  }));

  it('should open add modal', () => {
    component.openAddModal();
    expect(component.showModal).toBeTrue();
    expect(component.isEditing).toBeFalse();
    expect(component.selectedTask).toBeNull();
  });

  it('should open edit modal', () => {
    component.openEditModal(mockTasks[0]);
    expect(component.showModal).toBeTrue();
    expect(component.isEditing).toBeTrue();
    expect(component.selectedTask).toEqual(mockTasks[0]);
  });

  it('should close modal', () => {
    component.showModal = true;
    component.closeModal();
    expect(component.showModal).toBeFalse();
  });

  it('should create a task on save', () => {
    const newTask: Task = {
      id: 3,
      title: 'New Task',
      description: 'New Description',
      priority: 1,
      completed: false,
      inProgress: false,
      timeNeeded: 30,
      duedate: '2025-10-15'
    };
    taskService.createTask.and.returnValue(of(newTask));
    spyOn(component, 'closeModal');

    component.onSaveTask(newTask);

    expect(taskService.createTask).toHaveBeenCalledWith(newTask);
    expect(component.closeModal).toHaveBeenCalled();
  });

  it('should update a task on save', () => {
    component.isEditing = true;
    const updatedTask: Task = { ...mockTasks[0], title: 'Updated Task' };
    taskService.updateTask.and.returnValue(of(updatedTask));
    spyOn(component, 'closeModal');

    component.onSaveTask(updatedTask);

    expect(taskService.updateTask).toHaveBeenCalledWith(updatedTask.id, updatedTask);
    expect(component.closeModal).toHaveBeenCalled();
  });

  it('should delete a task', () => {
    taskService.deleteTask.and.returnValue(of(undefined));
    component.deleteTask(1);

    expect(taskService.deleteTask).toHaveBeenCalledWith(1);
  });

  it('should update a task', () => {
    const updatedTask: Task = { ...mockTasks[0], title: 'Updated Task' };
    taskService.updateTask.and.returnValue(of(updatedTask));
    component.updateTask(updatedTask);

    expect(taskService.updateTask).toHaveBeenCalledWith(updatedTask.id, updatedTask);
  });

  it('should handle logout', () => {
    spyOn(localStorage, 'removeItem');
    const navigateSpy = spyOn(component['router'], 'navigate');
    component.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});