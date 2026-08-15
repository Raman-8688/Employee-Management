package com.employee.projectknowledge.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_tech_stacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTechStack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category; // FRONTEND, BACKEND, DATABASE, DEVOPS, AI_INTEGRATION

    @Column(nullable = false)
    private String technologyName;

    private String version;
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnore
    @ToString.Exclude
    private EnterpriseProject project;
}
