package com.smartpark.springbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "slot_bookings")
@Getter
@Setter
@NoArgsConstructor
public class SlotBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column
    private String qrId;

    @Column(nullable = false)
    private String areaId;

    @Column(nullable = false)
    private String expiryAt;

    @Column
    private Long entryTime;

    @Column
    private Long exitTime;
}

