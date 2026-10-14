package com.example.zenve_vet.vetnetwork.repository;

import com.example.zenve_vet.vetnetwork.model.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClinicRepository extends JpaRepository<Clinic, Long> {

    List<Clinic> findByVet_IdOrderByCreatedAtDesc(Long vetId);
}