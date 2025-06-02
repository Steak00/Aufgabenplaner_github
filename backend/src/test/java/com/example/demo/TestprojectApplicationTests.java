package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = TestprojectApplication.class)
@ActiveProfiles("test") // or whatever profile you want to activate
class TestprojectApplicationTests {

    @Test
    void contextLoads() {
    }

}
