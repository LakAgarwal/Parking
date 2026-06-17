package com.smartpark.springbackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartpark.springbackend.model.QrCode;

public interface QrCodeRepository extends JpaRepository<QrCode, Long> {

    List<QrCode> findByUserId(String userId);
}

