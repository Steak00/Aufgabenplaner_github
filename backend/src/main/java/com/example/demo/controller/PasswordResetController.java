package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.ConfirmationToken;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.ConfirmationTokenRepository;
import com.example.demo.service.EmailSenderService;
import com.example.demo.service.PasswordResetService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Map;



@RestController
@RequestMapping("/api")
public class PasswordResetController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConfirmationTokenRepository confirmationTokenRepository;

    @Autowired
    private EmailSenderService emailSenderService;

    @Autowired
    private PasswordResetService passwordResetService;


    // Reset-Link anfordern durch Eingabe der Email Adresse
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
        if (user == null) {
            return ResponseEntity.badRequest().body("E-Mail existiert nicht.");
        }

        ConfirmationToken token = new ConfirmationToken(user);
        confirmationTokenRepository.save(token);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Passwort zurücksetzen");
        message.setFrom("test-email@gmail.com");
        message.setText("Zum Zurücksetzen des Passworts klicke auf folgenden Link: " +
                "http://localhost:4200" + "/reset-password?token=" + token.getConfirmationToken());

        emailSenderService.sendEmail(message);

        return ResponseEntity.ok("Reset-Link wurde an die E-Mail gesendet.");
    }

    // Token validieren
    @GetMapping("/confirm-reset")
    public ResponseEntity<?> confirmResetToken(@RequestParam("token") String tokenValue) {
        ConfirmationToken token = confirmationTokenRepository.findByConfirmationToken(tokenValue).orElseThrow(() -> new RuntimeException("ungültiger Token"));
        if (token == null) {
            return ResponseEntity.badRequest().body("Ungültiger Token");
        }
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token ist abgelaufen.");
        }

        return ResponseEntity.ok(Map.of("email", token.getUser().getEmail()));
    }

    // Neues Passwort setzen
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {

            passwordResetService.resetPassword(
                    request.get("email"),
                    request.get("password"),
                    request.get("token")
            );
            return ResponseEntity.ok("Passwort erfolgreich geändert.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }
}
