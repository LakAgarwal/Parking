package com.smartpark.springbackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartpark.springbackend.model.SlotBooking;

public interface SlotBookingRepository extends JpaRepository<SlotBooking, Long> {

    List<SlotBooking> findByUserId(String userId);
}


