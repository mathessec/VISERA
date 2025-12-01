package com.visera.backend.Service;
import com.visera.backend.Entity.Task;
import java.util.List;

public interface TaskService {
    Task createTask(Task task);
    List<Task> getTasksByUser(int userId);
    Task updateTaskStatus(int id, String status);
}
