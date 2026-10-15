package com.example.zenve_vet.messaging.repository;

import com.example.zenve_vet.messaging.model.ConversationState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationStateRepository extends JpaRepository<ConversationState, Long> {

    Optional<ConversationState> findByConversation_IdAndVet_Id(Long conversationId, Long vetId);

    List<ConversationState> findByVet_Id(Long vetId);
}
