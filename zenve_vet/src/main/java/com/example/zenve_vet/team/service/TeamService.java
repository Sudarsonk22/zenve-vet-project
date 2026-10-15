package com.example.zenve_vet.team.service;

import com.example.zenve_vet.common.exception.BadRequestException;
import com.example.zenve_vet.common.exception.ConflictException;
import com.example.zenve_vet.team.dto.TeamAuthRequest;
import com.example.zenve_vet.team.dto.TeamAuthResponse;
import com.example.zenve_vet.team.model.TeamMember;
import com.example.zenve_vet.team.repository.TeamMemberRepository;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class TeamService {

    private static final String SESSION_ERROR = "Team session expired. Sign in again.";

    private final TeamMemberRepository teamMemberRepository;

    public TeamService(TeamMemberRepository teamMemberRepository) {
        this.teamMemberRepository = teamMemberRepository;
    }

    public TeamAuthResponse signup(TeamAuthRequest request) {
        String email = request.email().trim().toLowerCase();
        if (teamMemberRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("A team account with this email already exists");
        }

        TeamMember member = new TeamMember();
        member.setEmail(email);
        member.setPasswordHash(hashPassword(request.password()));
        return startSession(member);
    }

    public TeamAuthResponse login(TeamAuthRequest request) {
        TeamMember member = teamMemberRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new BadRequestException("Incorrect email or password"));
        if (!passwordMatches(request.password(), member.getPasswordHash())) {
            throw new BadRequestException("Incorrect email or password");
        }
        return startSession(member);
    }

    public TeamMember authenticate(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException(SESSION_ERROR);
        }
        return teamMemberRepository.findByTokenHash(sha256(token.trim()))
                .orElseThrow(() -> new BadRequestException(SESSION_ERROR));
    }

    private TeamAuthResponse startSession(TeamMember member) {
        String token = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");
        member.setTokenHash(sha256(token));
        teamMemberRepository.save(member);
        return new TeamAuthResponse(member.getEmail(), token);
    }

    private String hashPassword(String password) {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return HexFormat.of().formatHex(salt) + ":" + HexFormat.of().formatHex(pbkdf2(password, salt));
    }

    private boolean passwordMatches(String password, String stored) {
        String[] parts = stored.split(":");
        byte[] salt = HexFormat.of().parseHex(parts[0]);
        byte[] expected = HexFormat.of().parseHex(parts[1]);
        return MessageDigest.isEqual(expected, pbkdf2(password, salt));
    }

    private byte[] pbkdf2(String password, byte[] salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 256);
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    private String sha256(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(text.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }
}