package com.smartpark.springbackend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartpark.springbackend.model.SlotBooking;
import com.smartpark.springbackend.service.SlotBookingService;

@RestController
@RequestMapping("/api/v1/slot")
public class SlotBookingController {

    private final SlotBookingService slotBookingService;

    public SlotBookingController(SlotBookingService slotBookingService) {
        this.slotBookingService = slotBookingService;
    }

    public static class CreateBookingRequest {
        @JsonProperty("user_id")
        public String userId;
        @JsonProperty("area_id")
        public String areaId;
    }

    @PostMapping("/")
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody CreateBookingRequest request) {
        SlotBooking booking = slotBookingService.createBooking(request.userId, request.areaId);

        Map<String, Object> response = new HashMap<>();
        response.put("newSlotBooking", toDto(booking));
        response.put("qrCodeSrc", "/qr/" + booking.getQrId());

        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/slotbookings/{userId}/{date}")
    public ResponseEntity<List<Map<String, Object>>> getBookingsForUserOnDate(
            @PathVariable("userId") String userId,
            @PathVariable("date") String date) {
        List<SlotBooking> bookings = slotBookingService.getBookingsForUserOnDate(userId, date);
        List<Map<String, Object>> result = bookings.stream()
                .map(SlotBookingController::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    private static Map<String, Object> toDto(SlotBooking booking) {
        Map<String, Object> map = new HashMap<>();
        map.put("_id", booking.getId());
        map.put("user_id", booking.getUserId());
        map.put("area_id", booking.getAreaId());
        map.put("Qr_id", booking.getQrId());
        map.put("expiryAt", booking.getExpiryAt());
        map.put("entry_time", booking.getEntryTime());
        map.put("exit_time", booking.getExitTime());
        return map;
    }
}

