package com.example.zenve_vet.team.repository;

import com.example.zenve_vet.team.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<TeamMember> findByEmailIgnoreCase(String email);

    Optional<TeamMember> findByTokenHash(String tokenHash);
}