import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { TaskService } from '../hello.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskItemComponent } from '../task-item/task-item.component';
import { Task } from '../task.model';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ReactiveFormsModule,
    TaskFormComponent,
    TaskItemComponent,
    RouterModule,
    NavigationComponent
  ],
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.css']
})
export class TasksListComponent implements OnInit, OnDestroy {
  tasks$!: Observable<Task[]>;
  filteredTasks$!: Observable<Task[]>;
  filterForm: FormGroup;
  currentPage$ = new BehaviorSubject<number>(1);
  totalPages$ = new BehaviorSubject<number>(1);
  pageSize = 10;
  showModal = false;
  isEditing = false;
  selectedTask: Task | null = null;
  private subscription: Subscription | null = null;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      selectedStatus: [''],
      selectedPriority: ['']
    });
  }

  ngOnInit() {
    this.tasks$ = this.taskService.getTasks();
    this.setupFilters();
    this.subscription = this.tasks$.subscribe({
      next: (tasks: Task[]) => console.log('Tasks loaded in tasks-list:', tasks),
      error: (error: unknown) => console.error('Fehler beim Laden der Aufgaben:', error)
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  setupFilters() {
    const formValues$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value)
    );

    this.filteredTasks$ = combineLatest([
      this.tasks$,
      formValues$,
      this.currentPage$
    ]).pipe(
      map(([tasks, { searchTerm, selectedStatus, selectedPriority }, currentPage]) => {
        let tempTasks = [...tasks];

        if (selectedStatus) {
          tempTasks = tempTasks.filter(task => this.getStatus(task) === selectedStatus);
        }
        if (selectedPriority) {
          tempTasks = tempTasks.filter(task => task.priority.toString() === selectedPriority);
        }
        if (searchTerm) {
          tempTasks = tempTasks.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        const totalPages = Math.ceil(tempTasks.length / this.pageSize);
        this.totalPages$.next(totalPages);

        const startIndex = (currentPage - 1) * this.pageSize;
        return tempTasks.slice(startIndex, startIndex + this.pageSize);
      })
    );
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages$.value || 1 }, (_, i) => i + 1);
  }

  changePage(page: number) {
    this.currentPage$.next(page);
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
        error: (error: any) => console.error('Fehler beim Aktualisieren:', error)
      });
    } else {
      this.taskService.createTask(task).subscribe({
        next: () => this.closeModal(),
        error: (error: any) => console.error('Fehler beim Erstellen:', error)
      });
    }
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.closeModal();
      },
      error: (error: any) => console.error('Fehler beim Löschen:', error)
    });
  }

  updateTask(updatedTask: Task) {
    this.taskService.updateTask(updatedTask.id, updatedTask).subscribe({
      next: () => {
        console.log('Task updated in tasks-list:', updatedTask);
      },
      error: (error: any) => console.error('Fehler beim Aktualisieren:', error)
    });
  }

  getStatus(task: Task): string {
    if (task.completed) return 'Erledigt';
    if (task.inProgress) return 'In Arbeit';
    return 'Offen';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}