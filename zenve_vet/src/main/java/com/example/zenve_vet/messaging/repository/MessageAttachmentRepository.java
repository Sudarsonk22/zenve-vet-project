package com.example.zenve_vet.messaging.repository;

import com.example.zenve_vet.messaging.model.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Long> {

    List<MessageAttachment> findByMessage_Id(Long messageId);
}
