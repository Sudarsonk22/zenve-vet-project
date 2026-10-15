package com.example.zenve_vet.team.controller;

import com.example.zenve_vet.team.dto.TeamAuthRequest;
import com.example.zenve_vet.team.dto.TeamAuthResponse;
import com.example.zenve_vet.team.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/team")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public TeamAuthResponse signup(@Valid @RequestBody TeamAuthRequest request) {
        return teamService.signup(request);
    }

    @PostMapping("/login")
    public TeamAuthResponse login(@Valid @RequestBody TeamAuthRequest request) {
        return teamService.login(request);
    }

    @GetMapping("/me")
    public TeamAuthResponse me(@RequestHeader("X-Team-Token") String token) {
        return new TeamAuthResponse(teamService.authenticate(token).getEmail(), null);
    }
}