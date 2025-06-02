import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { Task } from '../task.model';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, ReactiveFormsModule, RouterTestingModule, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isVisible false initially', () => {
    expect(component.isVisible).toBeFalse();
  });

  it('should initialize the form with default values', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(component.taskForm.value).toEqual({
      id: null,
      title: '',
      description: '',
      priority: 0,
      completed: false,
      inProgress: false,
      timeNeeded: 30,
      duedate: today
    });
  });

  it('should patch the form with task values when task input changes', () => {
    const task: Task = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      priority: 2,
      completed: false,
      inProgress: true,
      timeNeeded: 45,
      duedate: '15.05.2025'
    };
    component.task = task;
    component.ngOnChanges({
      task: { currentValue: task, previousValue: null, firstChange: true, isFirstChange: () => true }
    });
    expect(component.taskForm.value).toEqual({
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      priority: 2,
      completed: false,
      inProgress: true,
      timeNeeded: 45,
      duedate: '2025-05-15'
    });
    expect(component.isVisible).toBeTrue();
  });

  it('should handle due date in "YYYY-MM-DD" format', () => {
    const task: Task = {
      id: 1, title: 'Test', priority: 0, completed: false, inProgress: false, timeNeeded: 30, duedate: '2025-05-15',
      description: ''
    };
    component.task = task;
    component.ngOnChanges({
      task: { currentValue: task, previousValue: null, firstChange: true, isFirstChange: () => true }
    });
    expect(component.taskForm.get('duedate')?.value).toBe('2025-05-15');
  });

  it('should reset the form when task is null', () => {
    component.task = null;
    component.ngOnChanges({
      task: { currentValue: null, previousValue: { id: 1 }, firstChange: false, isFirstChange: () => false }
    });
    const today = new Date().toISOString().split('T')[0];
    expect(component.taskForm.value).toEqual({
      id: null,
      title: '',
      description: '',
      priority: 0,
      completed: false,
      inProgress: false,
      timeNeeded: 30,
      duedate: today
    });
  });

  it('should emit save event and hide form on submit', () => {
    const formValue: Task = {
      id: 0,
      title: 'New Task',
      description: 'New Description',
      priority: 1,
      completed: false,
      inProgress: false,
      timeNeeded: 60,
      duedate: '2025-06-01'
    };
    component.taskForm.setValue(formValue);
    const saveSpy = spyOn(component.save, 'emit');
    component.onSubmit();
    expect(saveSpy).toHaveBeenCalledWith(formValue);
    expect(component.isVisible).toBeFalse();
  });

  it('should emit close event and hide form on cancel', () => {
    const closeSpy = spyOn(component.close, 'emit');
    component.onCancel();
    expect(closeSpy).toHaveBeenCalled();
    expect(component.isVisible).toBeFalse();
  });

  it('should open date picker on openDatePicker call', () => {
    const inputElement = document.createElement('input') as HTMLInputElement;
    const focusSpy = spyOn(inputElement, 'focus');
    const showPickerSpy = spyOn(inputElement, 'showPicker');
    component.openDatePicker(inputElement);
    expect(focusSpy).toHaveBeenCalled();
    expect(showPickerSpy).toHaveBeenCalled();
  });

  it('should display correct header based on isEditing', () => {
    component.isVisible = true;
    component.isEditing = false;
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('h2');
    expect(header.textContent).toBe('Neue Aufgabe');
    component.isEditing = true;
    fixture.detectChanges();
    expect(header.textContent).toBe('Aufgabe bearbeiten');
  });

  it('should display correct submit button text based on isEditing', () => {
    component.isVisible = true;
    component.isEditing = false;
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.textContent).toBe('Erstellen');
    component.isEditing = true;
    fixture.detectChanges();
    expect(submitButton.textContent).toBe('Speichern');
  });

  it('should update form control when title input changes', () => {
    component.isVisible = true;
    fixture.detectChanges();
    const titleInput = fixture.nativeElement.querySelector('#title');
    titleInput.value = 'New Title';
    titleInput.dispatchEvent(new Event('input'));
    expect(component.taskForm.get('title')?.value).toBe('New Title');
  });

  it('should set priority correctly from select', () => {
    component.isVisible = true;
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('#priority');
    select.value = '2';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.taskForm.get('priority')?.value).toBe('2');
    const formValue = component.taskForm.value;
    expect(parseInt(formValue.priority, 10)).toBe(2);
  });

  it('should update due date form control when input changes', () => {
    component.isVisible = true;
    fixture.detectChanges();
    const dateInput = fixture.nativeElement.querySelector('#duedate');
    dateInput.value = '2025-06-01';
    dateInput.dispatchEvent(new Event('input'));
    expect(component.taskForm.get('duedate')?.value).toBe('2025-06-01');
  });
});