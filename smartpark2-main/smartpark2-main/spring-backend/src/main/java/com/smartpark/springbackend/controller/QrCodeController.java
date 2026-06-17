package com.smartpark.springbackend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartpark.springbackend.model.QrCode;
import com.smartpark.springbackend.model.SlotBooking;
import com.smartpark.springbackend.service.QrCodeService;

@RestController
@RequestMapping("/api/v1/qr")
public class QrCodeController {

    private final QrCodeService qrCodeService;

    public QrCodeController(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    @GetMapping("/{user_id}")
    public ResponseEntity<List<QrCode>> getUserQrCodes(@PathVariable("user_id") String userId) {
        return ResponseEntity.ok(qrCodeService.getUserQrCodes(userId));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<QrCode> getQrCode(@PathVariable Long id) {
        Optional<QrCode> qrCode = qrCodeService.getQrCodeById(id);
        return qrCode.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<QrCode> updateQrCode(@PathVariable Long id, @RequestBody QrCode qrCodeDetails) {
        try {
            return ResponseEntity.ok(qrCodeService.updateQrCode(id, qrCodeDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQrCode(@PathVariable Long id) {
        try {
            qrCodeService.deleteQrCode(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/details/{qr_id}")
    public ResponseEntity<List<SlotBooking>> getSlotBookingDetailsByQrId(@PathVariable("qr_id") String qrId) {
        return ResponseEntity.ok(qrCodeService.getSlotBookingDetailsByQrId(qrId));
    }
}
