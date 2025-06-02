package com.example.demo.controller;

import com.example.demo.model.ConfirmationToken;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ConfirmationTokenService;
import com.example.demo.service.EmailSenderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthController {

    @Autowired
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ConfirmationTokenService confirmationTokenService;
    private final EmailSenderService emailSenderService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, ConfirmationTokenService confirmationTokenService, EmailSenderService emailSenderService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.confirmationTokenService = confirmationTokenService;
        this.emailSenderService = emailSenderService;
    }

    @PostMapping("/api/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User already exists"));
        }



        user.setEnabled(false);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        ConfirmationToken confirmationToken = new ConfirmationToken(user);
        confirmationTokenService.saveConfirmationToken(confirmationToken);

        String confirmationLink = "http://localhost:4200" + "/confirm-email?token=" + confirmationToken.getConfirmationToken();
        String emailBody = "Hallo " + user.getFirstName() + ",\n\nBitte bestätigen sie ihre Email über diesen Link!\n\n" + confirmationLink;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Email bestätigen");
        //message.setFrom("test-email@gmail.com");
        message.setText(emailBody);

        emailSenderService.sendEmail(message);



        return ResponseEntity.ok(Map.of("message", "Bestätigungs-Email gesendet."));

    }
@Transactional
    @GetMapping("/api/confirm-email")
    public ResponseEntity<String> confirmToken(@RequestParam("token") String token) {
        ConfirmationToken confirmationToken = confirmationTokenService.getToken(token)
                .orElse(null);

        if (confirmationToken == null) {
            return ResponseEntity.badRequest().body("Token nicht gefunden");
        }

        if (confirmationToken.getConfirmedAt() != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("E-Mail wurde bereits bestätigt");
        }

    if (confirmationToken.getExpiresAt().isBefore(Instant.now())) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token ist abgelaufen");
        }

        confirmationToken.setConfirmedAt(LocalDateTime.now());
        confirmationTokenService.saveConfirmationToken(confirmationToken);

        //User user = confirmationToken.getUser();
        User user = userRepository.findById(confirmationToken.getUser().getId())
                .orElse(null);
        if(user==null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Benutzer nicht gefunden");
        }
        user.setEnabled(true);
        userRepository.save(user);

        return ResponseEntity.ok("E-Mail erfolgreich bestätigt");
    }

}
