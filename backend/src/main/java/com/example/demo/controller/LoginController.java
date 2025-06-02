package com.example.demo.controller;

import com.example.demo.model.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class LoginController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    @Getter @Setter
    private static Long loggedinuser;

    public LoginController(UserRepository userRepository, UserService userService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        loggedinuser = (long)-1;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        // nur verifizierte Email Adressen bzw. Nutzer zulassen
        if (userOptional.isPresent() &&
                passwordEncoder.matches(loginRequest.getPassword(), userOptional.get().getPassword()) && userOptional.get().isEnabled()){

            // Erfolg: Dummy-Token senden
            loggedinuser= userService.getIdByEmail(loginRequest.getEmail());
            return ResponseEntity.ok(Map.of("token", "dummy-token-123"));
        } else if (!userOptional.get().isEnabled()) {
            // Email ist noch nicht verifiziert
            loggedinuser = (long)-1;
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ist noch nicht verifiziert");

        } else {
            // Fehlerhafte Zugangsdaten
            loggedinuser = (long)-1;
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login fehlgeschlagen");
        }
    }
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteLogin(@RequestBody LoginRequest loginRequest) {
        System.out.println("User loeschen: " + loginRequest.getEmail());
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        if (userOptional.isPresent()) {
            userRepository.deleteById(userOptional.get().getId());
            return ResponseEntity.ok("User geloescht");
        }
        else{
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User nicht gefunden");
        }

    }

}
