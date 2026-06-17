package com.smartpark.springbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartpark.springbackend.model.Area;

public interface AreaRepository extends JpaRepository<Area, Long> {
}

