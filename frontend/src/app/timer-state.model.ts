export interface TimerState {
  timeRemaining:    number; // sec
  isRunning:        boolean;
  currentPhase:     'Arbeitszeit' | 'Kurze Pause' | 'Lange Pause';
  currentCycle:     number;
  workInterval:     number; // min
  shortBreak:       number; // min
  longBreak:        number; // min
  cycles:           number;
}