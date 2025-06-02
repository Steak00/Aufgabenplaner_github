package com.example.demo.service;

import com.example.demo.model.ConfirmationToken;
import com.example.demo.repository.ConfirmationTokenRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ConfirmationTokenService {

    private final ConfirmationTokenRepository confirmationTokenRepository;

    public ConfirmationTokenService(ConfirmationTokenRepository confirmationTokenRepository) {
        this.confirmationTokenRepository = confirmationTokenRepository;
    }

    public void saveConfirmationToken(ConfirmationToken confirmationToken) {
        confirmationTokenRepository.save(confirmationToken);
    }

    public Optional<ConfirmationToken> getToken(String confirmationToken) {
        return confirmationTokenRepository.findByConfirmationToken(confirmationToken);
    }

    public void setConfirmedAt(String token){
        ConfirmationToken confirmationToken = confirmationTokenRepository.findByConfirmationToken(token)
                .orElseThrow(() -> new IllegalStateException("Token not found"));

        confirmationToken.setConfirmedAt(LocalDateTime.now());
        confirmationTokenRepository.save(confirmationToken);
    }

    public void deleteExpiredConfirmationTokens() {
        confirmationTokenRepository.deleteAllByExpiryDateBefore(LocalDateTime.now());
    }
}


