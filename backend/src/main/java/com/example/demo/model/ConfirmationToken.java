package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

//Entität für Confirmation Token zum zurücksetzen des Passworts
@Getter
@Setter
@Entity
public class ConfirmationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String confirmationToken;


    private LocalDateTime createDate;
    private LocalDateTime expiryDate;
    private LocalDateTime confirmedAt;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    public ConfirmationToken() {}
    public ConfirmationToken(User user) {
        this.user = user;
        createDate = LocalDateTime.now();
        this.expiryDate = this.createDate.plusMinutes(30);
        confirmationToken = UUID.randomUUID().toString();
    }

    public void setConfirmedAt(LocalDateTime now) {
        this.confirmedAt = now;
    }

    public Instant getExpiresAt() {
        return this.expiryDate.atZone(java.time.ZoneId.systemDefault()).toInstant();
    }

}
