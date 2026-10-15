package com.example.zenve_vet.vetnetwork.repository;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VetRepository extends JpaRepository<VetProfile, Long> {

    Optional<VetProfile> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("""
            select v from VetProfile v
            where (lower(v.fullName) like lower(concat('%', :search, '%'))
                   or lower(v.specialty) like lower(concat('%', :search, '%'))
                   or lower(v.city) like lower(concat('%', :search, '%')))
              and (:specialty = '' or v.specialty = :specialty)
              and (:city = '' or v.city = :city)
              and (:state = '' or v.state = :state)
              and (:verifiedOnly = false or v.verified = true)
            """)
    Page<VetProfile> search(@Param("search") String search,
                            @Param("specialty") String specialty,
                            @Param("city") String city,
                            @Param("state") String state,
                            @Param("verifiedOnly") boolean verifiedOnly,
                            Pageable pageable);

    @Query("select distinct v.specialty from VetProfile v order by v.specialty")
    List<String> findSpecialties();

    @Query("select distinct v.city from VetProfile v order by v.city")
    List<String> findCities();
    @Query("select distinct v.state from VetProfile v where v.state is not null order by v.state")
    List<String> findStates();
}