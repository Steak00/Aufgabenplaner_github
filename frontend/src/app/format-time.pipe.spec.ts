import { FormatTimePipe } from './format-time.pipe';

describe('FormatTimePipe', () => {
  let pipe: FormatTimePipe;

  beforeEach(() => {
    pipe = new FormatTimePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform 0 seconds to "00:00"', () => {
    expect(pipe.transform(0)).toBe('00:00');
  });

  it('should transform 65 seconds to "01:05"', () => {
    expect(pipe.transform(65)).toBe('01:05');
  });

  it('should transform 600 seconds to "10:00"', () => {
    expect(pipe.transform(600)).toBe('10:00');
  });

  it('should transform 3599 seconds to "59:59"', () => {
    expect(pipe.transform(3599)).toBe('59:59');
  });

  it('should transform 3600 seconds to "60:00"', () => {
    expect(pipe.transform(3600)).toBe('60:00');
  });

  it('should handle single-digit seconds correctly (e.g., 5 seconds to "00:05")', () => {
    expect(pipe.transform(5)).toBe('00:05');
  });

  it('should handle single-digit minutes correctly (e.g., 125 seconds to "02:05")', () => {
    expect(pipe.transform(125)).toBe('02:05');
  });
});