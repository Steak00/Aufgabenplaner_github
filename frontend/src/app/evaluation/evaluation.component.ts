import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { EvaluationService } from '../evaluation.service';
import { EvaluationData } from '../evaluation.model';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent, NavigationComponent],
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css'],
})
export class EvaluationComponent implements OnInit, OnDestroy {
  evaluationData!: EvaluationData; // Non-null assertion since we set it in ngOnInit
  periodForm: FormGroup;
  private evaluationSubscription: Subscription | null = null;

  constructor(private fb: FormBuilder, private evaluationService: EvaluationService) {
    this.periodForm = this.fb.group({
      period: ['monthly'],
    });
  }

  ngOnInit() {
    this.evaluationSubscription = this.evaluationService.evaluationData$.subscribe((data) => {
      this.evaluationData = data;
    });

    this.periodForm.valueChanges.subscribe((value) => {
      this.evaluationService.updatePeriod(value.period);
    });
  }

  ngOnDestroy() {
    if (this.evaluationSubscription) {
      this.evaluationSubscription.unsubscribe();
    }
  }

  onSelectPeriod(period: string) {
    this.periodForm.patchValue({ period });
  }

  // Line chart helpers
  getLineChartPoints(): string {
    return this.evaluationData.productivityOverTime
      .map((point) => `${this.getX(point.day)},${this.getY(point.value)}`)
      .join(' ');
  }

  getX(day: number): number {
    const maxDay = Math.max(...this.evaluationData.productivityOverTime.map(p => p.day));
    return (day / maxDay) * 430;
  }

  getY(value: number): number {
    const maxValue = Math.max(...this.evaluationData.productivityOverTime.map(p => p.value));
    const minValue = Math.min(...this.evaluationData.productivityOverTime.map(p => p.value));
    const range = maxValue - minValue;
    return 60 - ((value - minValue) / (range || 1)) * 50;
  }

  // Pie chart helpers
  getPieSegmentPath(percentage: number, index: number): string {
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += this.evaluationData.taskDistribution[i].percentage * 3.6; // 360deg / 100%
    }
    const endAngle = startAngle + percentage * 3.6;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArcFlag = percentage > 50 ? 1 : 0;

    return `M50,50 L${x1},${y1} A40,40 0 ${largeArcFlag},1 ${x2},${y2} Z`;
  }
}