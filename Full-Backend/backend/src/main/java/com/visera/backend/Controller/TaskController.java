package com.visera.backend.Controller;

import com.visera.backend.DTOs.TaskDTO;
import com.visera.backend.Entity.Task;
import com.visera.backend.Service.TaskService;
import com.visera.backend.mapper.EntityMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    EntityMapper mapper;

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // Create task (by supervisor)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/create")
    public ResponseEntity<Task> create(@RequestBody Task task) {
        return ResponseEntity.ok(taskService.createTask(task));
    }

//    // Get all tasks for a worker
//    @GetMapping("/user/{userId}")
//    public ResponseEntity<List<Task>> getTasksByUser(@PathVariable int userId) {
//        return ResponseEntity.ok(taskService.getTasksByUser(userId));
//    }

    // Update status (worker completes)
    @PreAuthorize("hasAnyRole('ADMIN', 'WORKER')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable int id, @RequestParam String status) {
        Task t = taskService.updateTaskStatus(id, status);
        return (t != null) ? ResponseEntity.ok(t) : ResponseEntity.notFound().build();
    }

    //DTO
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskDTO>> getTasks(@PathVariable int userId) {
        return ResponseEntity.ok(
                taskService.getTasksByUser(userId).stream()
                        .map(mapper::toTaskDTO).toList()
        );
    }

}
