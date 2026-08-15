package com.employee.projectknowledge.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_database_schemas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDatabaseSchema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String dbType; // POSTGRESQL, MYSQL, ORACLE, MONGODB

    private String schemaName;

    @Column(nullable = false)
    private String tableName;

    @Column(length = 1000)
    private String tableDescription;

    @Column(length = 2000)
    private String columnsSummary;

    @Column(length = 1000)
    private String storedProceduresUsed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnore
    @ToString.Exclude
    private EnterpriseProject project;
}
