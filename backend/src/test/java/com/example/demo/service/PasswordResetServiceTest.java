package com.example.demo.service;

import com.example.demo.model.ConfirmationToken;
import com.example.demo.model.User;
import com.example.demo.repository.ConfirmationTokenRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PasswordResetServiceTest {

    private UserRepository userRepository;
    private ConfirmationTokenRepository tokenRepository;
    private PasswordEncoder passwordEncoder;
    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        tokenRepository = mock(ConfirmationTokenRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);

        passwordResetService = new PasswordResetService();

        // Inject dependencies manually (field injection style)
        try {
            var userRepoField = PasswordResetService.class.getDeclaredField("userRepository");
            userRepoField.setAccessible(true);
            userRepoField.set(passwordResetService, userRepository);

            var tokenRepoField = PasswordResetService.class.getDeclaredField("tokenRepository");
            tokenRepoField.setAccessible(true);
            tokenRepoField.set(passwordResetService, tokenRepository);

            var encoderField = PasswordResetService.class.getDeclaredField("passwordEncoder");
            encoderField.setAccessible(true);
            encoderField.set(passwordResetService, passwordEncoder);
        } catch (Exception e) {
            throw new RuntimeException("Failed to inject mocks into PasswordResetService", e);
        }
    }

    @Test
    void testResetPassword_Success() {
        String email = "test@example.com";
        String rawPassword = "newpassword";
        String encodedPassword = "encodedPassword";
        String tokenValue = "valid-token";

        User user = new User(1L, email, "oldPassword", "Test", true, false, false);
        ConfirmationToken token = new ConfirmationToken();
        token.setUser(user);

        when(tokenRepository.findByConfirmationToken(tokenValue)).thenReturn(Optional.of(token));
        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);

        passwordResetService.resetPassword(email, rawPassword, tokenValue);

        assertEquals(encodedPassword, user.getPassword());
        verify(userRepository, times(1)).save(user);
        verify(tokenRepository, times(1)).delete(token);
    }

    @Test
    void testResetPassword_InvalidToken() {
        String email = "test@example.com";
        String password = "password";
        String invalidToken = "invalid-token";

        when(tokenRepository.findByConfirmationToken(invalidToken)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                passwordResetService.resetPassword(email, password, invalidToken)
        );

        assertEquals("Ungültiger Token", exception.getMessage());
        verify(userRepository, never()).save(any());
        verify(tokenRepository, never()).delete(any());
    }
}
