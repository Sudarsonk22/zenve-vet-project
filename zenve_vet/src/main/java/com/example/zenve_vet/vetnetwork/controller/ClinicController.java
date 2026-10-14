package com.example.zenve_vet.vetnetwork.controller;

import com.example.zenve_vet.vetnetwork.dto.ClinicRequest;
import com.example.zenve_vet.vetnetwork.dto.ClinicResponse;
import com.example.zenve_vet.vetnetwork.service.ClinicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ClinicController {

    private final ClinicService clinicService;

    public ClinicController(ClinicService clinicService) {
        this.clinicService = clinicService;
    }

    @GetMapping("/vets/{vetId}/clinics")
    public List<ClinicResponse> list(@PathVariable Long vetId) {
        return clinicService.list(vetId);
    }

    @PostMapping("/vets/{vetId}/clinics")
    @ResponseStatus(HttpStatus.CREATED)
    public ClinicResponse create(@PathVariable Long vetId, @Valid @RequestBody ClinicRequest request) {
        return clinicService.create(vetId, request);
    }

    @PutMapping("/clinics/{id}")
    public ClinicResponse update(@PathVariable Long id, @Valid @RequestBody ClinicRequest request) {
        return clinicService.update(id, request);
    }

    @DeleteMapping("/clinics/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        clinicService.delete(id);
    }
}