import { FormatSortLabelPipe } from './format-sort-label.pipe';

describe('FormatSortLabelPipe', () => {
  let pipe: FormatSortLabelPipe;

  beforeEach(() => {
    pipe = new FormatSortLabelPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform "priority" to "Priorität"', () => {
    expect(pipe.transform('priority')).toBe('Priorität');
  });

  it('should transform "status" to "Status"', () => {
    expect(pipe.transform('status')).toBe('Status');
  });

  it('should transform "duedate" to "Fälligkeitsdatum"', () => {
    expect(pipe.transform('duedate')).toBe('Fälligkeitsdatum');
  });

  it('should transform "duration-short" to "Dauer (kurz)"', () => {
    expect(pipe.transform('duration-short')).toBe('Dauer (kurz)');
  });

  it('should transform "duration-long" to "Dauer (lang)"', () => {
    expect(pipe.transform('duration-long')).toBe('Dauer (lang)');
  });

  it('should return the input value if it does not match any case', () => {
    const unknownValue = 'unknown';
    expect(pipe.transform(unknownValue)).toBe(unknownValue);
  });
});