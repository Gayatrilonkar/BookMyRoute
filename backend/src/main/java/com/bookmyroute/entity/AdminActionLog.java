package com.bookmyroute.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_action_logs")
public class AdminActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(name = "action_type", nullable = false)
    private String actionType; // e.g., UPDATE_USER, CREATE_SCHEDULE

    @Column(name = "target_entity")
    private String targetEntity; // e.g., USER, SCHEDULE

    @Column(name = "target_entity_id")
    private String targetEntityId; // ID of the entity that was affected

    @Column(name = "action_details", columnDefinition = "TEXT")
    private String actionDetails; // JSON or text description of changes

    @Column(name = "ip_address")
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public AdminActionLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getAdmin() { return admin; }
    public void setAdmin(User admin) { this.admin = admin; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getTargetEntity() { return targetEntity; }
    public void setTargetEntity(String targetEntity) { this.targetEntity = targetEntity; }
    public String getTargetEntityId() { return targetEntityId; }
    public void setTargetEntityId(String targetEntityId) { this.targetEntityId = targetEntityId; }
    public String getActionDetails() { return actionDetails; }
    public void setActionDetails(String actionDetails) { this.actionDetails = actionDetails; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
