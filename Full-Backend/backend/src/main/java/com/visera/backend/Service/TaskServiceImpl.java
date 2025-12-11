package com.visera.backend.Service;
import com.visera.backend.Entity.Task;
import com.visera.backend.Repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository repo;

    public TaskServiceImpl(TaskRepository repo) {
        this.repo = repo;
    }

    @Override
    public Task createTask(Task task) {
        return repo.save(task);
    }

    @Override
    public List<Task> getTasksByUser(int userId) {
        return repo.findByUserId((long) userId);
    }

    @Override
    public Task updateTaskStatus(int id, String status) {
        return repo.findById((long) id).map(task -> {
            task.setStatus(status);
            return repo.save(task);
        }).orElse(null);
    }
}
