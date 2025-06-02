export interface Task {
  id:           number;
  title:        string;
  description:  string;
  completed:    boolean;
  inProgress:   boolean;
  priority:     number;
  timeNeeded:    number;
  duedate:      string;
}