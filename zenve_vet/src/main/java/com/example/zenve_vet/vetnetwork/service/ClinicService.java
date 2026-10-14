package com.example.zenve_vet.vetnetwork.service;

import com.example.zenve_vet.common.exception.NotFoundException;
import com.example.zenve_vet.vetnetwork.dto.ClinicRequest;
import com.example.zenve_vet.vetnetwork.dto.ClinicResponse;
import com.example.zenve_vet.vetnetwork.model.Clinic;
import com.example.zenve_vet.vetnetwork.model.VetProfile;
import com.example.zenve_vet.vetnetwork.repository.ClinicRepository;
import com.example.zenve_vet.vetnetwork.repository.VetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class ClinicService {

    private final ClinicRepository clinicRepository;
    private final VetRepository vetRepository;

    public ClinicService(ClinicRepository clinicRepository, VetRepository vetRepository) {
        this.clinicRepository = clinicRepository;
        this.vetRepository = vetRepository;
    }

    @Transactional(readOnly = true)
    public List<ClinicResponse> list(Long vetId) {
        return clinicRepository.findByVet_IdOrderByCreatedAtDesc(vetId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ClinicResponse create(Long vetId, ClinicRequest request) {
        VetProfile vet = vetRepository.findById(vetId)
                .orElseThrow(() -> new NotFoundException("Vet not found"));
        Clinic clinic = new Clinic();
        clinic.setVet(vet);
        fill(clinic, request);
        return toResponse(clinicRepository.save(clinic));
    }

    @Transactional
    public ClinicResponse update(Long id, ClinicRequest request) {
        Clinic clinic = find(id);
        fill(clinic, request);
        return toResponse(clinicRepository.save(clinic));
    }

    @Transactional
    public void delete(Long id) {
        clinicRepository.delete(find(id));
    }

    private Clinic find(Long id) {
        return clinicRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Clinic not found"));
    }

    private void fill(Clinic clinic, ClinicRequest request) {
        clinic.setName(request.name().trim());
        clinic.setLocation(request.location());
        clinic.setAddress(request.address());
        clinic.setPhone(request.phone());
        clinic.setOpeningHours(request.openingHours());
        clinic.setServices(request.services());
        clinic.setAbout(request.about());
        clinic.setPhotoUrl(request.photoUrl());
    }

    private ClinicResponse toResponse(Clinic clinic) {
        List<String> services = clinic.getServices() == null || clinic.getServices().isBlank()
                ? List.of()
                : Arrays.stream(clinic.getServices().split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();
        return new ClinicResponse(
                clinic.getId(),
                clinic.getVet().getId(),
                clinic.getName(),
                clinic.getLocation(),
                clinic.getAddress(),
                clinic.getPhone(),
                clinic.getOpeningHours(),
                services,
                clinic.getAbout(),
                clinic.getPhotoUrl());
    }
}