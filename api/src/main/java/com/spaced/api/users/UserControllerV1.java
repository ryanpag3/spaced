package com.spaced.api.users;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
public class UserControllerV1 {
   
    @PostMapping("/users")
    public void createUser() {
        // Create a new user
    }
    
}
