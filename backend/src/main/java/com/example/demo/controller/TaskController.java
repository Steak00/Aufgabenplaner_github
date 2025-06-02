package com.example.demo.controller;

import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import com.example.demo.service.TaskService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
//@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final TaskService taskService;

    public TaskController(TaskRepository taskRepository, TaskService taskService) {
        this.taskRepository = taskRepository;
        this.taskService = taskService;
    }

    @GetMapping("/get")
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasksByUserId(LoginController.getLoggedinuser());  // Abrufen der Aufgaben fuer userid
        System.out.println("TaskController: " + tasks);
        if (tasks.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);  // Wenn keine Aufgaben vorhanden sind
        }
        return new ResponseEntity<>(tasks, HttpStatus.OK);  // Aufgaben zurückgeben
    }

    @PostMapping("/add") // Endpunkt für die Aufgabe
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        long userid = LoginController.getLoggedinuser();
        System.out.println("Empfangene Aufgabe: " + task + ", userid: " + userid);
        if (task.getTitle() == null || task.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Task t = new Task(task.getId(), userid, task.getTitle(), task.getDescription(), task.getPriority(), task.isCompleted(), task.isInProgress(), task.getTimeNeeded(), task.getDuedate(), null, null);
        Task savedTask = taskRepository.save(t);
        return ResponseEntity.ok(savedTask);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();  // Kein Inhalt zurückgeben nach erfolgreichem Löschen
    }

    @PostMapping("/edit/{id}")
    public ResponseEntity<Task> editTask(@PathVariable Long id, @RequestBody Task updatedTask) {
        System.out.println("Zu Bearbeitende Aufgabe: " + updatedTask);

        Task taskfromDB = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));


        taskfromDB.setTitle(updatedTask.getTitle());
        taskfromDB.setDescription(updatedTask.getDescription());
        taskfromDB.setPriority(updatedTask.getPriority());
        taskfromDB.setCompleted(updatedTask.isCompleted());
        taskfromDB.setDuedate(updatedTask.getDuedate());
        taskfromDB.setTimeNeeded(updatedTask.getTimeNeeded());
        taskfromDB.setInProgress(updatedTask.isInProgress());
        if(updatedTask.isCompleted()) {taskfromDB.setDonedate(new Date(System.currentTimeMillis()));}
        else taskfromDB.setDonedate(null);
        if(taskfromDB.getStartdate() == null && updatedTask.isInProgress()) {taskfromDB.setStartdate(new Date(System.currentTimeMillis()));}


        //int rowsupdated = taskRepository.updateuserbyid(task.getTitle(),task.isCompleted(), task.getDescription(), task.getPriority(), task.getId());
        taskRepository.save(taskfromDB);
        return ResponseEntity.ok(taskfromDB);
    }

    @GetMapping("/getstats/{amountdays}")
    public ResponseEntity<Map<String, String>> getStatistics(@PathVariable int amountdays) {
        Map<String, String> response = new HashMap<>();
        List<Task> tasks = taskService.findTaskByDonedateAfterAndUserid(amountdays, LoginController.getLoggedinuser());

        response.put("countTasks", String.valueOf(tasks.size()));
        response.put("totalfocustimeneeded", String.valueOf(tasks.stream().mapToInt(Task::getTimeNeeded).sum()));

        int totaltasksinprogress = 0;
        int totaltaskscompleted = 0;
        int totaltasksnotstarted = 0;
        for (Task task : tasks) {
            if (task.isInProgress()) {
                totaltasksinprogress++;
            }
            else if (task.isCompleted()) {
                totaltaskscompleted++;
            }
            else {
                totaltasksnotstarted++;
            }
        }
        response.put("totaltasksinprogress", String.valueOf(totaltasksinprogress));
        response.put("totaltaskscompleted", String.valueOf(totaltaskscompleted));
        response.put("totaltasksnotstarted", String.valueOf(totaltasksnotstarted));

        return ResponseEntity.ok(response);
    }
}