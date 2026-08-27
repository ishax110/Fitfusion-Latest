package com.fitfusion.fitfusion_backend.controller;

import com.fitfusion.fitfusion_backend.dto.AuthResponse;
import com.fitfusion.fitfusion_backend.dto.LoginRequest;
import com.fitfusion.fitfusion_backend.dto.RegisterRequest;
import com.fitfusion.fitfusion_backend.entity.User;
import com.fitfusion.fitfusion_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request){
        User user = authService.register(request);
        Map<String,Object> response = Map.of(
                "message","Registration Successful",
                "userId" , user.getId(),
                "name" , user.getName(),
                "email" , user.getEmail(),
                "role" , user.getRole()
        );
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")

    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request){
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
