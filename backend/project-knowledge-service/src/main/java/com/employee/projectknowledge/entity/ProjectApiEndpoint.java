package com.employee.projectknowledge.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_api_endpoints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectApiEndpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String httpMethod; // GET, POST, PUT, DELETE

    @Column(nullable = false)
    private String endpointUrl;

    private String controllerName;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnore
    @ToString.Exclude
    private EnterpriseProject project;
}
