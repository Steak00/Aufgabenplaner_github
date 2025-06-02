package com.example.demo.service;

import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.sql.Date;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TaskServiceTest {

    private TaskRepository taskRepository;
    private TaskService taskService;
    Date dateNow = new Date(System.currentTimeMillis());


    @BeforeEach
    void setUp() {
        taskRepository = mock(TaskRepository.class);
        taskService = new TaskService(taskRepository);
    }

    @Test
    void testGetAllTasksByUserId() {
        Long userId = 1L;
        List<Task> mockTasks = Arrays.asList(
                new Task(1L, userId, "Task 1", "Description 1", 1, false, false, 30,  dateNow, null, null),
                new Task(2L, userId, "Task 2", "Description 2", 2, true, false, 20, (dateNow), null, null)
        );

        when(taskRepository.findTaskByUserid(userId)).thenReturn(mockTasks);

        List<Task> tasks = taskService.getAllTasksByUserId(userId);

        assertEquals(2, tasks.size());
        assertEquals("Task 1", tasks.get(0).getTitle());
        verify(taskRepository, times(1)).findTaskByUserid(userId);
    }

    @Test
    void testSaveTask() {
        Task task = new Task(null, 1L, "New Task", "New Description", 1, false, false,50, dateNow, null, null);
        Task savedTask = new Task(10L, 1L, "New Task", "New Description", 1, false, true, 10, dateNow, null, null);

        when(taskRepository.save(task)).thenReturn(savedTask);

        Task result = taskService.saveTask(task);

        assertNotNull(result.getId());
        assertEquals("New Task", result.getTitle());
        verify(taskRepository, times(1)).save(task);
    }

    @Test
    void testDeleteTask() {
        Long taskId = 5L;

        taskService.deleteTask(taskId);

        verify(taskRepository, times(1)).deleteById(taskId);
    }
}
