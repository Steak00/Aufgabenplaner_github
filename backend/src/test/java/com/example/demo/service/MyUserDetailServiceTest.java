package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MyUserDetailsServiceTest {

    private UserRepository userRepository;
    private MyUserDetailsService myUserDetailsService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        myUserDetailsService = new MyUserDetailsService(userRepository);
    }

    @Test
    void loadUserByUsername_UserExists_ReturnsUserDetails() {
        // Arrange
        User user = new User(1L, "test@example.com", "securePassword", "John", true, false, false );
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        // Act
        UserDetails userDetails = myUserDetailsService.loadUserByUsername("test@example.com");

        // Assert
        assertEquals("test@example.com", userDetails.getUsername());
        assertEquals("securePassword", userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().isEmpty()); // Since no roles are set
    }

    @Test
    void loadUserByUsername_UserDoesNotExist_ThrowsException() {
        // Arrange
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> myUserDetailsService.loadUserByUsername("missing@example.com")
        );

        assertEquals("User not found with email: missing@example.com", exception.getMessage());
    }
}
