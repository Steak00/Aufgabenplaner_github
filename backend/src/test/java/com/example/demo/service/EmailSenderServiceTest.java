package com.example.demo.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.Mockito.*;

class EmailSenderServiceTest {

    private JavaMailSender javaMailSender;
    private EmailSenderService emailSenderService;

    @BeforeEach
    void setUp() {
        javaMailSender = mock(JavaMailSender.class);
        emailSenderService = new EmailSenderService();

        // Inject mock manually since field is private
        // Use reflection because field is @Autowired and private
        try {
            java.lang.reflect.Field field = EmailSenderService.class.getDeclaredField("javaMailSender");
            field.setAccessible(true);
            field.set(emailSenderService, javaMailSender);
        } catch (Exception e) {
            throw new RuntimeException("Failed to inject javaMailSender", e);
        }
    }

    @Test
    void testSendEmail() {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("test@example.com");
        message.setSubject("Test Subject");
        message.setText("Hello, this is a test.");

        emailSenderService.sendEmail(message);

        verify(javaMailSender, times(1)).send(message);
    }
}
