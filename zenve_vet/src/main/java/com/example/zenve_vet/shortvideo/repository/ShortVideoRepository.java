package com.example.zenve_vet.shortvideo.repository;

import com.example.zenve_vet.shortvideo.model.ShortVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ShortVideoRepository
        extends JpaRepository<ShortVideo, Long>, JpaSpecificationExecutor<ShortVideo> {

    @Query("select distinct v.category from ShortVideo v where v.category is not null order by v.category")
    List<String> findCategories();

    @Query("select distinct v.animalType from ShortVideo v where v.animalType is not null order by v.animalType")
    List<String> findAnimalTypes();

    @Query("select distinct v.specialty from ShortVideo v where v.specialty is not null order by v.specialty")
    List<String> findSpecialties();
}
