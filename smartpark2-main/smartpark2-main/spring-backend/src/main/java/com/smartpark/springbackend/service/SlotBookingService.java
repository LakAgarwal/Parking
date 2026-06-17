package com.smartpark.springbackend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.smartpark.springbackend.model.QrCode;
import com.smartpark.springbackend.model.SlotBooking;
import com.smartpark.springbackend.repository.QrCodeRepository;
import com.smartpark.springbackend.repository.SlotBookingRepository;

@Service
public class SlotBookingService {

    private final SlotBookingRepository slotBookingRepository;
    private final QrCodeRepository qrCodeRepository;

    public SlotBookingService(SlotBookingRepository slotBookingRepository, QrCodeRepository qrCodeRepository) {
        this.slotBookingRepository = slotBookingRepository;
        this.qrCodeRepository = qrCodeRepository;
    }

    public SlotBooking createBooking(String userId, String areaId) {
        String serial = UUID.randomUUID().toString();

        QrCode qr = new QrCode();
        qr.setUserId(userId);
        qr.setSerialNo(serial);
        qr.setPath("/qr/" + serial);
        qrCodeRepository.save(qr);

        SlotBooking booking = new SlotBooking();
        booking.setUserId(userId);
        booking.setAreaId(areaId);
        booking.setQrId(qr.getId().toString());
        booking.setExpiryAt(LocalDate.now().toString());

        return slotBookingRepository.save(booking);
    }

    public List<SlotBooking> getBookingsForUserOnDate(String userId, String date) {
        return slotBookingRepository.findByUserId(userId);
    }
}

