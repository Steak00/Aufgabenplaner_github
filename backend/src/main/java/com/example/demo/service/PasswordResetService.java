package com.example.demo.service;


import com.example.demo.model.ConfirmationToken;
import com.example.demo.model.User;
import com.example.demo.repository.ConfirmationTokenRepository;
import com.example.demo.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

// Service zum Zurücksetzen des Passworts
@Service
public class PasswordResetService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ConfirmationTokenRepository tokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;


    @Transactional
    public void resetPassword(String email, String password, String tokenValue) {
        ConfirmationToken token = tokenRepository.findByConfirmationToken(tokenValue)
                .orElseThrow(() -> new RuntimeException("Ungültiger Token"));

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        tokenRepository.delete(token);
    }
}

