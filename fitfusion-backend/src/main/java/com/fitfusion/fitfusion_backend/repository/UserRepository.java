package com.fitfusion.fitfusion_backend.repository;

import com.fitfusion.fitfusion_backend.entity.User;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface UserRepository extends JpaRepository<User,UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
