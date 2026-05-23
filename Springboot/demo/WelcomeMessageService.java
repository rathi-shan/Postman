package com.example.demodemo;

import org.springframework.stereotype.Service;

@Service
public class WelcomeMessageService implements MessageService {

    @Override
    public String getMessage() {
        return "System Online: Spring Boot API is running.";
    }
}