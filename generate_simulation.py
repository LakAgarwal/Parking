import cv2
import numpy as np
import os

def create_parking_simulation():
    print("Generating simulated CCTV parking video...")
    
    # Video properties
    width, height = 1280, 720
    fps = 30
    duration_sec = 45
    total_frames = fps * duration_sec
    output_filename = "parking_simulation.mp4"
    
    # Define slots (x1, y1, x2, y2)
    slots = [
        {"id": "A1", "rect": [150, 200, 270, 420]},
        {"id": "A2", "rect": [320, 200, 440, 420]},
        {"id": "A3", "rect": [490, 200, 610, 420]},
        {"id": "B1", "rect": [670, 200, 790, 420]},
        {"id": "B2", "rect": [840, 200, 960, 420]},
        {"id": "B3", "rect": [1010, 200, 1130, 420]}
    ]
    
    # Define cars
    # States: 'inactive', 'entering', 'parked', 'leaving', 'exited'
    cars = [
        {
            "id": 1,
            "color": (50, 50, 220), # Red
            "slot_idx": 1, # Slot A2
            "start_frame": 60,
            "park_duration": 400,
            "state": "inactive",
            "pos": [0, 600],
            "angle": 0
        },
        {
            "id": 2,
            "color": (220, 100, 50), # Blue
            "slot_idx": 4, # Slot B2
            "start_frame": 200,
            "park_duration": 500,
            "state": "inactive",
            "pos": [0, 600],
            "angle": 0
        },
        {
            "id": 3,
            "color": (50, 200, 200), # Yellow
            "slot_idx": 0, # Slot A1
            "start_frame": 400,
            "park_duration": 800, # Stays till near end
            "state": "inactive",
            "pos": [0, 600],
            "angle": 0
        },
        {
            "id": 4,
            "color": (150, 150, 150), # Silver
            "slot_idx": 5, # Slot B3
            "start_frame": 650,
            "park_duration": 600,
            "state": "inactive",
            "pos": [0, 600],
            "angle": 0
        }
    ]
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_filename, fourcc, fps, (width, height))
    
    # Pre-render base background with asphalt noise
    base_bg = np.ones((height, width, 3), dtype=np.uint8) * 75
    # Add noise for texture
    noise = np.random.normal(0, 3, base_bg.shape).astype(np.int16)
    base_bg = np.clip(base_bg.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    
    # Draw concrete parking lot details
    # Main road lines
    cv2.line(base_bg, (0, 520), (width, 520), (120, 120, 120), 4)
    # Parking block separator line
    cv2.line(base_bg, (100, 422), (1180, 422), (200, 200, 200), 5)
    cv2.line(base_bg, (100, 198), (1180, 198), (200, 200, 200), 5)
    
    # Draw parking slots lines
    for slot in slots:
        x1, y1, x2, y2 = slot["rect"]
        # Side lines of the slot
        cv2.line(base_bg, (x1, y1), (x1, y2), (220, 220, 220), 3)
        cv2.line(base_bg, (x2, y1), (x2, y2), (220, 220, 220), 3)
        # Back line
        cv2.line(base_bg, (x1, y1), (x2, y1), (220, 220, 220), 3)
        
        # Add some curb markings
        cv2.rectangle(base_bg, (x1 - 5, y1 - 10), (x2 + 5, y1), (100, 100, 100), -1)
    
    # Text overhead details (like a real CCTV feed)
    font = cv2.FONT_HERSHEY_SIMPLEX
    
    def draw_car(img, pos, color, angle, state, is_parked=False):
        # pos is the center of the car
        cx, cy = int(pos[0]), int(pos[1])
        car_w, car_h = 75, 140 # width and height aligned vertically (for parking)
        
        # Create a car overlay image to rotate
        car_overlay = np.zeros((200, 200, 3), dtype=np.uint8)
        # Center of overlay
        ocx, ocy = 100, 100
        
        # Draw car body
        # Wheels (black rectangles)
        cv2.rectangle(car_overlay, (ocx - 42, ocy - 50), (ocx - 38, ocy - 20), (20, 20, 20), -1)
        cv2.rectangle(car_overlay, (ocx + 38, ocy - 50), (ocx + 42, ocy - 20), (20, 20, 20), -1)
        cv2.rectangle(car_overlay, (ocx - 42, ocy + 20), (ocx - 38, ocy + 50), (20, 20, 20), -1)
        cv2.rectangle(car_overlay, (ocx + 38, ocy + 20), (ocx + 42, ocy + 50), (20, 20, 20), -1)
        
        # Main body
        cv2.rectangle(car_overlay, (ocx - 36, ocy - 60), (ocx + 36, ocy + 60), color, -1)
        # Roof (lighter shade of color)
        roof_color = tuple(min(c + 40, 255) for c in color)
        cv2.rectangle(car_overlay, (ocx - 30, ocy - 30), (ocx + 30, ocy + 30), roof_color, -1)
        # Windshield (dark glass)
        cv2.rectangle(car_overlay, (ocx - 26, ocy - 35), (ocx + 26, ocy - 25), (40, 40, 40), -1)
        # Rear glass
        cv2.rectangle(car_overlay, (ocx - 26, ocy + 30), (ocx + 26, ocy + 38), (40, 40, 40), -1)
        # Headlights
        if not is_parked:
            cv2.circle(car_overlay, (ocx - 25, ocy - 60), 6, (100, 255, 255), -1)
            cv2.circle(car_overlay, (ocx + 25, ocy - 60), 6, (100, 255, 255), -1)
        # Taillights
        cv2.circle(car_overlay, (ocx - 28, ocy + 60), 5, (0, 0, 200), -1)
        cv2.circle(car_overlay, (ocx + 28, ocy + 60), 5, (0, 0, 200), -1)
        
        # Rotate car image
        M = cv2.getRotationMatrix2D((ocx, ocy), angle, 1.0)
        rotated_car = cv2.warpAffine(car_overlay, M, (200, 200))
        
        # Overlay on the main frame with masking (non-black pixels)
        # Crop region from main frame
        y1_crop, y2_crop = cy - 100, cy + 100
        x1_crop, x2_crop = cx - 100, cx + 100
        
        # Ensure we stay within frame boundaries
        if y1_crop < 0 or y2_crop > height or x1_crop < 0 or x2_crop > width:
            # Handle border overlap
            return
            
        roi = img[y1_crop:y2_crop, x1_crop:x2_crop]
        gray_rotated = cv2.cvtColor(rotated_car, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray_rotated, 1, 255, cv2.THRESH_BINARY)
        mask_inv = cv2.bitwise_not(mask)
        
        img_bg = cv2.bitwise_and(roi, roi, mask=mask_inv)
        car_fg = cv2.bitwise_and(rotated_car, rotated_car, mask=mask)
        
        dst = cv2.add(img_bg, car_fg)
        img[y1_crop:y2_crop, x1_crop:x2_crop] = dst

    # Main video frame loop
    for frame_idx in range(total_frames):
        frame = base_bg.copy()
        
        # Render static text elements
        time_str = f"2026-05-23  {12 + (frame_idx // 1800):02d}:{(frame_idx // 30) % 60:02d}:{((frame_idx // 30) * 1) % 60:02d}"
        cv2.putText(frame, "CCTV - PARKING LOT 1", (30, 45), font, 1.0, (255, 255, 255), 2, cv2.LINE_AA)
        cv2.putText(frame, time_str, (width - 380, 45), font, 0.8, (255, 255, 255), 2, cv2.LINE_AA)
        cv2.putText(frame, "CAM 04 - GATEWAY ENTRANCE", (30, 75), font, 0.6, (180, 180, 180), 1, cv2.LINE_AA)
        
        # Update cars positions and states
        for car in cars:
            slot_rect = slots[car["slot_idx"]]["rect"]
            slot_cx = (slot_rect[0] + slot_rect[2]) / 2
            slot_cy = (slot_rect[1] + slot_rect[3]) / 2
            
            # State machine
            if car["state"] == "inactive" and frame_idx >= car["start_frame"]:
                car["state"] = "entering"
                car["pos"] = [-100.0, 600.0]
                car["angle"] = 270 # facing right (relative to standard OpenCV coordinates, wait: 270 deg means facing left/up? Let's check rotation: standard rotation is counter-clockwise. A vertical car is 0. If it faces right, it is rotated 90 deg clockwise (-90 or 270). Let's use standard degrees: 0 means facing up, 90 facing right, 180 down, 270 left)
                car["angle"] = 90 # facing right
            
            if car["state"] == "entering":
                # Drive right on the road until slot x-coordinate is reached
                target_x = slot_cx
                if car["pos"][0] < target_x:
                    car["pos"][0] += 8.0 # speed
                    car["angle"] = 90 # facing right
                else:
                    # Turn up into the parking slot
                    car["pos"][0] = target_x
                    if car["pos"][1] > slot_cy:
                        car["pos"][1] -= 5.0 # backing or pulling in? Pulling in: y decreases
                        car["angle"] = 0 # facing up
                    else:
                        # Arrived
                        car["pos"][1] = slot_cy
                        car["state"] = "parked"
                        car["park_end_frame"] = frame_idx + car["park_duration"]
            
            elif car["state"] == "parked":
                # Check if it's time to leave
                if frame_idx >= car["park_end_frame"] and car["park_duration"] < 700:
                    car["state"] = "leaving"
            
            elif car["state"] == "leaving":
                # Reverse out of the slot (y increases)
                if car["pos"][1] < 600.0:
                    car["pos"][1] += 4.0
                    car["angle"] = 180 # facing down (reversing)
                else:
                    # Once on the road, turn right and drive off
                    car["pos"][1] = 600.0
                    car["angle"] = 90 # facing right
                    car["pos"][0] += 7.0
                    if car["pos"][0] > width + 100:
                        car["state"] = "exited"
                        
            # Render car if active
            if car["state"] in ["entering", "parked", "leaving"]:
                is_parked = (car["state"] == "parked")
                draw_car(frame, car["pos"], car["color"], car["angle"], car["state"], is_parked)
        
        out.write(frame)
        
    out.release()
    print(f"Simulation video successfully saved to {output_filename}")

if __name__ == "__main__":
    create_parking_simulation()
