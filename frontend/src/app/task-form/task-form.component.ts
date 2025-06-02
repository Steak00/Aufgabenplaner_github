import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnChanges {
  @Input() isEditing: boolean = false;
  @Input() task: Task | null = null;
  @Output() save = new EventEmitter<Task>();
  @Output() close = new EventEmitter<void>();

  taskForm: FormGroup;
  isVisible: boolean = false;

  constructor(private fb: FormBuilder) {
    const today = new Date().toISOString().split('T')[0];

    this.taskForm = this.fb.group({
      id: [null],
      title: [''],
      description: [''],
      priority: [0],
      completed: [false],
      inProgress: [false],
      timeNeeded: [30],
      duedate: [today] // Umbenannt von dueDate zu duedate
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['task'] || changes['isEditing']) {
      if (this.task) {
        const taskValue = { ...this.task };
        // Konvertiere duedate aus "dd.MM.yyyy" in "YYYY-MM-DD"
        if (taskValue.duedate) {
          const datePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
          if (datePattern.test(taskValue.duedate)) {
            const [, day, month, year] = taskValue.duedate.match(datePattern)!;
            taskValue.duedate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            taskValue.duedate = new Date(taskValue.duedate).toISOString().split('T')[0];
          }
        }
        this.taskForm.patchValue(taskValue);
      } else {
        const today = new Date().toISOString().split('T')[0];
        this.taskForm.reset({
          id: null,
          title: '',
          description: '',
          priority: 0,
          completed: false,
          inProgress: false,
          timeNeeded: 30,
          duedate: today // Umbenannt
        });
      }
      this.isVisible = true;
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      this.save.emit(formValue);
      this.isVisible = false;
    }
  }

  onCancel() {
    this.close.emit();
    this.isVisible = false;
  }

  openDatePicker(inputElement: HTMLInputElement) {
    inputElement.focus();
    inputElement.showPicker();
  }
}