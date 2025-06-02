package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userid; // Foreign key

    private String title;
    private String description;
    private int priority; // 1 = niedrig, 2 = mittel, 3 = hoch
    private boolean completed;
    private boolean inProgress; // In Arbeit
    private int timeNeeded;
    private Date duedate;
    private Date donedate = null;
    private Date startdate = null; // in Progress-start-date
}
