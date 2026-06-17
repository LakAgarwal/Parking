package com.smartpark.springbackend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.smartpark.springbackend.model.Area;
import com.smartpark.springbackend.repository.AreaRepository;

@Service
public class AreaService {

    private final AreaRepository areaRepository;

    public AreaService(AreaRepository areaRepository) {
        this.areaRepository = areaRepository;
    }

    public List<Area> getAllAreas() {
        return areaRepository.findAll();
    }

    public Optional<Area> getAreaById(Long id) {
        return areaRepository.findById(id);
    }

    public Area createArea(Area area) {
        return areaRepository.save(area);
    }

    public Area updateArea(Long id, Area areaDetails) {
        return areaRepository.findById(id).map(area -> {
            area.setAreaname(areaDetails.getAreaname());
            area.setAreaLocation(areaDetails.getAreaLocation());
            area.setTotalslots(areaDetails.getTotalslots());
            if (areaDetails.getImagePath() != null) {
                area.setImagePath(areaDetails.getImagePath());
            }
            return areaRepository.save(area);
        }).orElseThrow(() -> new RuntimeException("Area not found with id " + id));
    }

    public void deleteArea(Long id) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Area not found with id " + id));
        areaRepository.delete(area);
    }
}
