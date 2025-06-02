// WORK IN PROGRESS

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EvaluationData } from './evaluation.model';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  private evaluationSubject$ = new BehaviorSubject<EvaluationData>(this.getMockData());
  evaluationData$: Observable<EvaluationData> = this.evaluationSubject$.asObservable();

  constructor() {}

  getMockData(): EvaluationData {
    return {
      completedTasks: {
        count: 42,
        total: 54,
        percentageChange: 12,
      },
      focusTime: {
        hours: 26,
        minutes: 30,
        percentageChange: 5,
      },
      focusTimePerDay: {
        hours: 3,
        minutes: 12,
        percentageChange: 8,
      },
      productivityOverTime: [
        { day: 1, value: 42 }, { day: 5, value: 38 }, { day: 10, value: 40 },
        { day: 15, value: 37 }, { day: 20, value: 35 }, { day: 25, value: 50 },
        { day: 30, value: 35 },
      ],
      taskDistribution: [
        { status: 'in_progress', label: 'In Arbeit', percentage: 30, colors: ['#ff9800'] }, // Orange
        { status: 'completed', label: 'Erledigt', percentage: 50, colors: ['#4caf50'] },  // Green
        { status: 'open', label: 'Offen', percentage: 20, colors: ['#f44336'] },       // Red
      ],
    };
  }

  updatePeriod(period: string) {
    // Placeholder for future backend integration
    console.log('Period updated:', period);
    // Simulate data refresh with mock data
    this.evaluationSubject$.next(this.getMockData());
  }
}