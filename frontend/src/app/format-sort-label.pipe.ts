import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatSortLabel',
  standalone: true,
})
export class FormatSortLabelPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'priority':
        return 'Priorität';
      case 'status':
        return 'Status';
      case 'duedate':
        return 'Fälligkeitsdatum';
      case 'duration-short':
        return 'Dauer (kurz)';
      case 'duration-long':
        return 'Dauer (lang)';
      default:
        return value;
    }
  }
}