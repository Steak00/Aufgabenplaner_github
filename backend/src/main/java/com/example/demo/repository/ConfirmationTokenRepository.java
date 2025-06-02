package com.example.demo.repository;

import com.example.demo.model.ConfirmationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ConfirmationTokenRepository extends JpaRepository<ConfirmationToken, Long> {
    Optional<ConfirmationToken> findByConfirmationToken(String confirmationToken);

    void deleteByConfirmationToken(String confirmationToken);

    void deleteAllByExpiryDateBefore(LocalDateTime now);
}
