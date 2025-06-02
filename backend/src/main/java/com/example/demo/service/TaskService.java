package com.example.demo.service;

import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getAllTasksByUserId(Long userid) {
        //List<Task> tasks = taskRepository.findAll();
        List<Task> tasks = taskRepository.findTaskByUserid(userid);
        System.out.println("TaskService: " + tasks);
        return tasks;
    }

    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public List<Task> findTaskByDonedateAfterAndUserid(int amountdays, Long userid) {
        LocalDate searchdate = new Date(System.currentTimeMillis()).toLocalDate();
        searchdate = searchdate.minusDays(amountdays);
        return taskRepository.findTaskByDonedateAfterAndUserid(java.sql.Date.valueOf(searchdate), userid);
    }
}
