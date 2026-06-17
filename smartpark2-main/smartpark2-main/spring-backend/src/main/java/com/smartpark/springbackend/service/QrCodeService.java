package com.smartpark.springbackend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.smartpark.springbackend.model.QrCode;
import com.smartpark.springbackend.model.SlotBooking;
import com.smartpark.springbackend.repository.QrCodeRepository;
import com.smartpark.springbackend.repository.SlotBookingRepository;

@Service
public class QrCodeService {

    private final QrCodeRepository qrCodeRepository;
    private final SlotBookingRepository slotBookingRepository;

    public QrCodeService(QrCodeRepository qrCodeRepository, SlotBookingRepository slotBookingRepository) {
        this.qrCodeRepository = qrCodeRepository;
        this.slotBookingRepository = slotBookingRepository;
    }

    public List<QrCode> getUserQrCodes(String userId) {
        return qrCodeRepository.findByUserId(userId);
    }

    public Optional<QrCode> getQrCodeById(Long id) {
        return qrCodeRepository.findById(id);
    }

    public QrCode updateQrCode(Long id, QrCode qrCodeDetails) {
        return qrCodeRepository.findById(id).map(qr -> {
            qr.setPath(qrCodeDetails.getPath());
            qr.setSerialNo(qrCodeDetails.getSerialNo());
            return qrCodeRepository.save(qr);
        }).orElseThrow(() -> new RuntimeException("QrCode not found with id " + id));
    }

    public void deleteQrCode(Long id) {
        QrCode qrCode = qrCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QrCode not found with id " + id));
        qrCodeRepository.delete(qrCode);
    }

    public List<SlotBooking> getSlotBookingDetailsByQrId(String qrId) {
        return slotBookingRepository.findAll().stream()
                .filter(booking -> qrId.equals(booking.getQrId()))
                .toList();
    }
}
