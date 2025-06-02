import { first } from 'rxjs/operators';
import { Component, Input, Output, EventEmitter, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../task.model';
import { TaskService } from '../hello.service';
import { TimerService } from '../timer.service';
import { TimerState } from '../timer-state.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.css']
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Input() isLocked: boolean = false;
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<number>();
  @Output() updated = new EventEmitter<Task>();

  constructor(
    private taskService: TaskService,
    private injector: Injector
  ) {}

  getStatus(task: Task): string {
    if (task.completed) return 'Erledigt';
    if (task.inProgress) return 'In Arbeit';
    return 'Offen';
  }

  getStatusClass(task: Task): string {
    const status = this.getStatus(task);
    switch (status) {
      case 'Erledigt': return 'status-completed';
      case 'In Arbeit': return 'status-in-progress';
      case 'Offen': return 'status-open';
      default: return '';
    }
  }

  getPriorityLabel(priority: number): string {
    switch (priority) {
      case 1: return 'Niedrig';
      case 2: return 'Mittel';
      case 3: return 'Hoch';
      default: return 'Unbekannt';
    }
  }

  getPriorityClass(priority: number): string {
    switch (priority) {
      case 1: return 'priority-low';
      case 2: return 'priority-medium';
      case 3: return 'priority-high';
      default: return '';
    }
  }

  toggleCompleted(): void {
    const updatedTask = { ...this.task, completed: !this.task.completed };
    this.taskService.updateTask(updatedTask.id, updatedTask).subscribe({
      next: () => {
        if (updatedTask.completed) {
          const timerService = this.injector.get(TimerService);
          timerService.state$.pipe(first()).subscribe((state: TimerState) => {
            if (this.isLocked && state.currentPhase === 'Arbeitszeit' && state.timeRemaining > 0) {
              // Scenario a): Locked task checked off during work phase
              timerService.skipPhase(); // Move to break and start it
              this.taskService.lockTask(null); // Unlock the task
            } else if (this.isLocked && state.currentPhase !== 'Arbeitszeit' && !state.isRunning) {
              // Scenario a): Locked task checked off after work phase ends
              timerService.startTimer(); // Start the break
              this.taskService.lockTask(null); // Unlock the task
            }
            // Scenario c): Non-locked task checked off, no timer change
          });
        }
        this.updated.emit(updatedTask);
      },
      error: (error: any) => console.error('Fehler beim Aktualisieren der Aufgabe:', error)
    });
  }

  formatDate(date: string): string {
    const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (datePattern.test(date)) {
      const [, year, month, day] = date.match(datePattern)!;
      return `${day}.${month}.${year}`;
    }
    return date;
  }

  getDueDateDisplay(task: Task): { text: string; color: string } {
    if (!task.duedate) {
      return { text: '-', color: 'black' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.duedate);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      return { text: `${diffDays}d`, color: 'black' };
    } else if (diffDays < 0) {
      return { text: `${diffDays}d`, color: 'red' };
    } else {
      return { text: `${diffDays}d`, color: 'green' };
    }
  }
}