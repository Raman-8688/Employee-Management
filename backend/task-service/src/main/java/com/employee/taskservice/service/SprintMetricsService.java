package com.employee.taskservice.service;

import com.employee.taskservice.entity.TaskItem;
import com.employee.taskservice.repository.TaskRepository;
import com.employee.taskservice.repository.TaskTimeLogRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SprintMetricsService {

    private final TaskRepository taskRepository;
    private final TaskTimeLogRepository timeLogRepository;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SprintMetrics {
        private long totalTasks;
        private long completedTasks;
        private long inProgressTasks;
        private long bugsSolved;
        private double totalHoursLogged7Days;
        private double velocityPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeTaskAnalytics {
        private Long employeeId;
        private String employeeName;
        private long totalAssignedTasks;
        private long completedTasks;
        private long bugsFixed;
        private long storiesCompleted;
        private double totalHoursLogged;
        private double completionRatePercentage;
    }

    public SprintMetrics getWeeklySprintMetrics() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<TaskItem> allTasks = taskRepository.findAll();

        long totalTasks = allTasks.size();
        long completedTasks = allTasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count();
        long inProgressTasks = allTasks.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count();
        long bugsSolved = allTasks.stream()
                .filter(t -> "DONE".equalsIgnoreCase(t.getStatus()) && "BUG".equalsIgnoreCase(t.getTaskType()))
                .count();

        Double hours7Days = timeLogRepository.sumHoursSinceDate(sevenDaysAgo);
        double totalHoursLogged7Days = hours7Days != null ? hours7Days : 0.0;

        double velocityPercentage = totalTasks > 0 ? ((double) completedTasks / totalTasks) * 100.0 : 0.0;

        return SprintMetrics.builder()
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .inProgressTasks(inProgressTasks)
                .bugsSolved(bugsSolved)
                .totalHoursLogged7Days(Math.round(totalHoursLogged7Days * 10.0) / 10.0)
                .velocityPercentage(Math.round(velocityPercentage * 10.0) / 10.0)
                .build();
    }

    public EmployeeTaskAnalytics getEmployeeAnalytics(Long employeeId) {
        List<TaskItem> assignedTasks = taskRepository.findByAssigneeId(employeeId);
        long totalAssigned = assignedTasks.size();

        long completed = assignedTasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count();
        long bugsFixed = assignedTasks.stream()
                .filter(t -> "DONE".equalsIgnoreCase(t.getStatus()) && "BUG".equalsIgnoreCase(t.getTaskType()))
                .count();
        long storiesCompleted = assignedTasks.stream()
                .filter(t -> "DONE".equalsIgnoreCase(t.getStatus()) && ("STORY".equalsIgnoreCase(t.getTaskType()) || "TASK".equalsIgnoreCase(t.getTaskType())))
                .count();

        Double hours = timeLogRepository.sumHoursByEmployeeId(employeeId);
        double totalHoursLogged = hours != null ? hours : 0.0;

        double completionRate = totalAssigned > 0 ? ((double) completed / totalAssigned) * 100.0 : 0.0;

        String empName = assignedTasks.stream()
                .map(TaskItem::getAssigneeName)
                .filter(name -> name != null && !name.isEmpty())
                .findFirst()
                .orElse("Employee #" + employeeId);

        return EmployeeTaskAnalytics.builder()
                .employeeId(employeeId)
                .employeeName(empName)
                .totalAssignedTasks(totalAssigned)
                .completedTasks(completed)
                .bugsFixed(bugsFixed)
                .storiesCompleted(storiesCompleted)
                .totalHoursLogged(Math.round(totalHoursLogged * 10.0) / 10.0)
                .completionRatePercentage(Math.round(completionRate * 10.0) / 10.0)
                .build();
    }
}
