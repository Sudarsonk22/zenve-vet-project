package com.example.zenve_vet.advertise.repository;

import com.example.zenve_vet.advertise.model.Campaign;
import com.example.zenve_vet.advertise.model.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findByAdvertiser_IdOrderByCreatedAtDesc(Long advertiserId);

    List<Campaign> findByStatusOrderByCreatedAtAsc(CampaignStatus status);

    long countByAdvertiser_Id(Long advertiserId);

    @Query("select count(c) from Campaign c where c.advertiser.id = :id and c.status = 'APPROVED' "
            + "and c.startsAt <= :now and (c.endsAt is null or c.endsAt > :now)")
    long countLive(@Param("id") Long advertiserId, @Param("now") LocalDateTime now);

    @Query("select coalesce(sum(c.views), 0) from Campaign c where c.advertiser.id = :id")
    long totalViews(@Param("id") Long advertiserId);

    @Query("select coalesce(sum(c.clicks), 0) from Campaign c where c.advertiser.id = :id")
    long totalClicks(@Param("id") Long advertiserId);
}