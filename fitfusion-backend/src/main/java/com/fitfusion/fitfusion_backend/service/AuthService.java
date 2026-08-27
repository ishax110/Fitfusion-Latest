package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.AuthResponse;
import com.fitfusion.fitfusion_backend.dto.LoginRequest;
import com.fitfusion.fitfusion_backend.dto.RegisterRequest;
import com.fitfusion.fitfusion_backend.entity.Role;
import com.fitfusion.fitfusion_backend.entity.User;
import com.fitfusion.fitfusion_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService (
        UserRepository userRepository,
        PasswordEncoder passwordEncoder , JwtService jwtService){

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    public User register(RegisterRequest request){
        String email = request.getEmail()
                .trim()
                .toLowerCase();

        if(userRepository.existsByEmail(email)){
            throw new IllegalArgumentException(
                    "An account with this email already exists"
            );
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Determine role — only USER or TRAINER allowed at registration
        Role role = Role.USER;
        if ("TRAINER".equalsIgnoreCase(request.getRole())) {
            role = Role.TRAINER;
        }

        User user = new User(
                request.getName().trim(),
                email,
                hashedPassword,
                role
        );
        return userRepository.save(user);
    }
public AuthResponse login(LoginRequest loginRequest){
        String email = loginRequest.getEmail()
                .trim()
                .toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(()->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                        );

    boolean passwordMatches =
            passwordEncoder.matches(
                    loginRequest.getPassword(),
                    user.getPassword()
            );

    if(!passwordMatches){
        throw  new IllegalArgumentException(
                "Invalid Email or Password"
        );
    }

    String token = jwtService.generateToken(user);
    return new AuthResponse(token);

}


}
