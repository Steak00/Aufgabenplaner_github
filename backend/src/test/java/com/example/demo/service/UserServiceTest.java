package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void testCheckPassword_CorrectPassword() {
        String email = "user@example.com";
        String rawPassword = "123456";
        String encodedPassword = "$2a$10$encoded";

        User user = new User(1L, email, encodedPassword, "John", true, false, false);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, encodedPassword)).thenReturn(true);

        boolean result = userService.checkPassword(email, rawPassword);

        assertTrue(result);
        verify(userRepository).findByEmail(email);
        verify(passwordEncoder).matches(rawPassword, encodedPassword);
    }

    @Test
    void testCheckPassword_IncorrectPassword() {
        String email = "user@example.com";
        String rawPassword = "wrongpass";
        String encodedPassword = "$2a$10$encoded";

        User user = new User(1L, email, encodedPassword, "John", true, false, false);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, encodedPassword)).thenReturn(false);

        boolean result = userService.checkPassword(email, rawPassword);

        assertFalse(result);
    }

    @Test
    void testCheckPassword_UserNotFound() {
        String email = "unknown@example.com";
        String rawPassword = "123456";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        boolean result = userService.checkPassword(email, rawPassword);

        assertFalse(result);
    }

    @Test
    void testGetIdByEmail_UserExists() {
        String email = "user@example.com";
        Long expectedId = 42L;

        User user = new User(expectedId, email, "pass", "Alice", true, false, false );
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        Long actualId = userService.getIdByEmail(email);

        assertEquals(expectedId, actualId);
    }

    @Test
    void testGetIdByEmail_UserNotFound() {
        String email = "unknown@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        Long id = userService.getIdByEmail(email);

        assertNull(id);
    }
}
