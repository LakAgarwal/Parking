import os
import json
import cv2
import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS
import threading
import time
import subprocess

app = Flask(__name__)
CORS(app)

class SlotClassifier:
    def __init__(self, model_path="parking_model.pth"):
        self.device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        print(f"[Classifier] Loading on device: {self.device}")
        
        # Load ResNet18
        try:
            from torchvision.models import ResNet18_Weights
            self.model = models.resnet18(weights=ResNet18_Weights.DEFAULT)
        except ImportError:
            self.model = models.resnet18(pretrained=True)
            
        num_ftrs = self.model.fc.in_features
        self.model.fc = nn.Linear(num_ftrs, 2)
        
        self.model_loaded = False
        if os.path.exists(model_path):
            try:
                print(f"[Classifier] Loading custom weights from {model_path}...")
                self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                self.model_loaded = True
            except Exception as e:
                print(f"[Classifier] Error loading model weights: {e}. Using pre-trained ResNet18.")
        else:
            print("[Classifier] Custom weights not found. Using pre-trained ImageNet classifier fallback.")
            
        self.model = self.model.to(self.device)
        self.model.eval()
        
        # Data transforms (same as used during training)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        # Load ImageNet labels for zero-shot fallback
        self.vehicle_labels = ['car', 'cab', 'wagon', 'minivan', 'limousine', 'truck', 'jeep', 'van', 'bus', 'suv']
        
    def predict(self, crop_bgr, bg_crop_bgr=None):
        # 1. Use the fine-tuned ResNet18 model directly if it has been loaded
        if self.model_loaded:
            crop_rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(crop_rgb)
            tensor_img = self.transform(pil_img).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(tensor_img)
                probs = torch.softmax(outputs, dim=1)
                _, preds = torch.max(outputs, 1)
                is_occupied = (preds.item() == 1)
                confidence = probs[0][preds.item()].item()
            return bool(is_occupied), float(confidence)

        # 2. Fall back to background difference heuristic if model not loaded
        if bg_crop_bgr is not None and bg_crop_bgr.shape == crop_bgr.shape:
            # Resize crops to 224x224 to normalize metrics
            c_crop = cv2.resize(crop_bgr, (224, 224))
            c_bg = cv2.resize(bg_crop_bgr, (224, 224))
            
            color_diff = np.mean(cv2.absdiff(c_crop, c_bg))
            
            gray_bg = cv2.cvtColor(c_bg, cv2.COLOR_BGR2GRAY)
            var_bg = np.var(cv2.Laplacian(gray_bg, cv2.CV_64F))
            
            # Hybrid background-difference logic
            if color_diff < 12.0:
                # Matches background state
                is_occupied = (var_bg >= 220.0)
                confidence = min(1.0 - (color_diff / 24.0), 1.0)
                return bool(is_occupied), float(confidence)
            elif color_diff >= 18.0:
                # Different from background state
                is_occupied = (var_bg < 220.0)
                confidence = min((color_diff - 18.0) / 20.0, 1.0)
                return bool(is_occupied), float(confidence)
                
        # 3. Fall back to Laplacian variance if no model and no background crop
        gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY)
        variance = np.var(cv2.Laplacian(gray, cv2.CV_64F))
        is_occupied = variance > 250.0 
        confidence = min(variance / 500.0, 1.0)
        return bool(is_occupied), float(confidence)

def get_median_background(video_path):
    if not isinstance(video_path, str) or not os.path.exists(video_path):
        return None
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return None
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            cap.release()
            return None
        
        # Sample 15 frames evenly
        sample_indices = np.linspace(0, total_frames - 1, min(15, total_frames), dtype=int)
        frames = []
        for idx in sample_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                frames.append(frame)
        cap.release()
        
        if len(frames) >= 3:
            median_frame = np.median(frames, axis=0).astype(dtype=np.uint8)
            return median_frame
    except Exception as e:
        print(f"[Auto-Detect] Error computing median background: {e}")
    return None

def warp_quadrilateral(frame, points, target_w=224, target_h=224):
    """
    Warps a 4-point quadrilateral region from the frame to a flat target rectangle.
    points: list of 4 points [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] (TL, TR, BR, BL)
    """
    pts1 = np.float32(points)
    pts2 = np.float32([[0, 0], [target_w - 1, 0], [target_w - 1, target_h - 1], [0, target_h - 1]])
    matrix = cv2.getPerspectiveTransform(pts1, pts2)
    warped = cv2.warpPerspective(frame, matrix, (target_w, target_h))
    return warped

def auto_detect_slots(frame):
    h, w, _ = frame.shape
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 40, 120, apertureSize=3)
    
    # Run Hough lines with reasonable thresholds
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=60, maxLineGap=20)
    
    if lines is None:
        return []
        
    vertical_lines = []
    horizontal_lines = []
    
    for line in lines:
        x1, y1, x2, y2 = line[0]
        dx = abs(x1 - x2)
        dy = abs(y1 - y2)
        length = np.sqrt(dx*dx + dy*dy)
        if length < 40:
            continue
            
        # Classify line by slope
        if dy > 0 and dx / dy < 0.6:  # Mostly vertical (slanted up to ~30 degrees)
            if y1 > y2:
                x1, y1, x2, y2 = x2, y2, x1, y1
            vertical_lines.append((x1, y1, x2, y2))
        elif dx > 0 and dy / dx < 0.6:  # Mostly horizontal
            if x1 > x2:
                x1, y1, x2, y2 = x2, y2, x1, y1
            horizontal_lines.append((x1, y1, x2, y2))
            
    if not vertical_lines:
        return []
        
    vertical_lines.sort(key=lambda l: (l[1] + l[3]) / 2)
    rows = []
    for line in vertical_lines:
        mid_y = (line[1] + line[3]) / 2
        placed = False
        for row in rows:
            row_mid_y = np.mean([(l[1] + l[3]) / 2 for l in row])
            if abs(mid_y - row_mid_y) < 120:
                row.append(line)
                placed = True
                break
        if not placed:
            rows.append([line])
            
    vertical_slots = []
    for row_idx, row_lines in enumerate(rows):
        # Sort row lines from left to right by midpoint X
        row_lines.sort(key=lambda l: (l[0] + l[2]) / 2)
        
        # Cluster lines that are very close horizontally
        unique_lines = []
        for line in row_lines:
            mid_x = (line[0] + line[2]) / 2
            duplicate = False
            for u_line in unique_lines:
                u_mid_x = (u_line[0] + u_line[2]) / 2
                if abs(mid_x - u_mid_x) < 30:
                    duplicate = True
                    break
            if not duplicate:
                unique_lines.append(line)
                
        # Build slots between adjacent line segments
        for i in range(len(unique_lines) - 1):
            l1 = unique_lines[i]
            l2 = unique_lines[i+1]
            
            x1_l = (l1[0] + l1[2]) / 2
            x2_l = (l2[0] + l2[2]) / 2
            
            width = x2_l - x1_l
            if 80 <= width <= 280:
                y1_top = min(l1[1], l2[1])
                y2_bottom = max(l1[3], l2[3])
                
                height = y2_bottom - y1_top
                if height < 120:
                    diff = 160 - height
                    y1_top = max(0, y1_top - diff // 2)
                    y2_bottom = min(h, y2_bottom + diff // 2)
                    
                slot_id = f"A{len(vertical_slots)+1}"
                vertical_slots.append({
                    "id": slot_id,
                    "rect": [int(x1_l), int(y1_top), int(x2_l), int(y2_bottom)]
                })
                
    horizontal_slots = []
    if len(horizontal_lines) > 1:
        # Cluster horizontal lines into columns based on midpoint X
        horizontal_lines.sort(key=lambda l: (l[0] + l[2]) / 2)
        
        cols = []
        for line in horizontal_lines:
            mid_x = (line[0] + line[2]) / 2
            placed = False
            for col in cols:
                col_mid_x = np.mean([(l[0] + l[2]) / 2 for l in col])
                if abs(mid_x - col_mid_x) < 150:
                    col.append(line)
                    placed = True
                    break
            if not placed:
                cols.append([line])
                
        for col_idx, col_lines in enumerate(cols):
            # Sort col lines top-to-bottom by midpoint Y
            col_lines.sort(key=lambda l: (l[1] + l[3]) / 2)
            
            # Cluster lines that are very close vertically
            unique_lines = []
            for line in col_lines:
                mid_y = (line[1] + line[3]) / 2
                duplicate = False
                for u_line in unique_lines:
                    u_mid_y = (u_line[1] + u_line[3]) / 2
                    if abs(mid_y - u_mid_y) < 30:
                        duplicate = True
                        break
                if not duplicate:
                    unique_lines.append(line)
                    
            # Build slots between adjacent line segments
            for i in range(len(unique_lines) - 1):
                l1 = unique_lines[i]
                l2 = unique_lines[i+1]
                
                y1_l = (l1[1] + l1[3]) / 2
                y2_l = (l2[1] + l2[3]) / 2
                
                height = y2_l - y1_l
                if 80 <= height <= 280:
                    x1_left = min(l1[0], l2[0])
                    x2_right = max(l1[2], l2[2])
                    
                    width = x2_right - x1_left
                    if width < 120:
                        diff = 160 - width
                        x1_left = max(0, x1_left - diff // 2)
                        x2_right = min(w, x2_right + diff // 2)
                        
                    slot_id = f"B{len(horizontal_slots)+1}"
                    horizontal_slots.append({
                        "id": slot_id,
                        "rect": [int(x1_left), int(y1_l), int(x2_right), int(y2_l)]
                    })
                    
    if len(vertical_slots) >= len(horizontal_slots):
        return vertical_slots
    else:
        return horizontal_slots


class ParkingMonitor:
    def __init__(self):
        # Find the latest uploaded video if any exists to resume with the latest custom file
        latest_upload = "parking_simulation.mp4"
        upload_files = [f for f in os.listdir(os.getcwd()) if f.startswith("uploaded_video_") and f.endswith(".mp4")]
        if upload_files:
            upload_files.sort()
            latest_upload = os.path.join(os.getcwd(), upload_files[-1])
        elif os.path.exists("uploaded_video.mp4"):
            latest_upload = os.path.join(os.getcwd(), "uploaded_video.mp4")
            
        self.video_source = latest_upload
        self.background_frame = None
        self.slots = []
        self.slot_status = {}  # {slot_id: {"occupied": bool, "confidence": float}}
        self.lock = threading.Lock()
        self.load_slots()
        self.classifier = SlotClassifier()
        self.is_running = True
        self.frame_to_stream = None
        self.last_raw_frame = None
        self.history_log = []
        
        # Training state
        self.training_in_progress = False
        self.training_logs = ""
        
        # Start background stream loop
        self.thread = threading.Thread(target=self._run_monitor, daemon=True)
        self.thread.start()
        
    def load_slots(self):
        with self.lock:
            if os.path.exists("slots.json"):
                try:
                    with open("slots.json", "r") as f:
                        self.slots = json.load(f)
                except Exception:
                    self._create_default_slots()
            else:
                self._create_default_slots()
                
            # Initialize status structure
            for slot in self.slots:
                if slot["id"] not in self.slot_status:
                    self.slot_status[slot["id"]] = {"occupied": False, "confidence": 1.0}

    def _create_default_slots(self):
        self.slots = [
            {"id": "A1", "rect": [150, 200, 270, 420]},
            {"id": "A2", "rect": [320, 200, 440, 420]},
            {"id": "A3", "rect": [490, 200, 610, 420]},
            {"id": "B1", "rect": [670, 200, 790, 420]},
            {"id": "B2", "rect": [840, 200, 960, 420]},
            {"id": "B3", "rect": [1010, 200, 1130, 420]}
        ]
        self.save_slots_no_lock()

    def save_slots_no_lock(self):
        with open("slots.json", "w") as f:
            json.dump(self.slots, f, indent=4)
            
    def update_slots(self, new_slots):
        with self.lock:
            self.slots = new_slots
            self.save_slots_no_lock()
            
            # Keep status list synchronized
            current_ids = {s["id"] for s in self.slots}
            self.slot_status = {k: v for k, v in self.slot_status.items() if k in current_ids}
            for s in self.slots:
                if s["id"] not in self.slot_status:
                    self.slot_status[s["id"]] = {"occupied": False, "confidence": 1.0}

    def add_log(self, text):
        timestamp = time.strftime("%H:%M:%S")
        self.history_log.append(f"[{timestamp}] {text}")
        if len(self.history_log) > 50:
            self.history_log.pop(0)

    def reload_model(self):
        with self.lock:
            self.classifier = SlotClassifier()

    def _run_monitor(self):
        print(f"[Monitor] Starting video capture stream from: {self.video_source}")
        cap = cv2.VideoCapture(self.video_source)
        
        frame_idx = 0
        current_source = self.video_source
        self.background_frame = get_median_background(current_source)
        
        while self.is_running:
            # Check if source video changed
            with self.lock:
                src_changed = (self.video_source != current_source)
                
            if src_changed:
                with self.lock:
                    print(f"[Monitor] Re-initializing capture stream from new source: {self.video_source}")
                    cap.release()
                    cap = cv2.VideoCapture(self.video_source)
                    current_source = self.video_source
                    frame_idx = 0
                    self.background_frame = get_median_background(current_source)
            
            # Check if source video file exists
            if not os.path.exists(current_source):
                time.sleep(1.0)
                continue
                
            ret, frame = cap.read()
            if not ret:
                # Video ended, loop back to the start
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
                
            frame_idx += 1
            
            # Save raw frame copy safely for slot detection
            with self.lock:
                self.last_raw_frame = frame.copy()
            
            # Read slots safely
            with self.lock:
                current_slots = list(self.slots)
                
            # Perform classification every 15 frames (~0.5s) to save CPU/GPU cycles
            if frame_idx % 15 == 0 or frame_idx == 1:
                for slot in current_slots:
                    x1, y1, x2, y2 = slot.get("rect", [0, 0, 10, 10])
                    h, w, _ = frame.shape
                    x1, y1 = max(0, int(x1)), max(0, int(y1))
                    x2, y2 = min(w, int(x2)), min(h, int(y2))
                    
                    crop = None
                    if x2 > x1 and y2 > y1:
                        crop = frame[y1:y2, x1:x2]
                    
                    if crop is not None and crop.size > 0:
                        # Crop background matching region
                        bg_crop = None
                        if self.background_frame is not None:
                            h_bg, w_bg, _ = self.background_frame.shape
                            x1_bg = max(0, min(w_bg - 1, int(x1)))
                            y1_bg = max(0, min(h_bg - 1, int(y1)))
                            x2_bg = max(0, min(w_bg, int(x2)))
                            y2_bg = max(0, min(h_bg, int(y2)))
                            if x2_bg > x1_bg and y2_bg > y1_bg:
                                bg_crop = self.background_frame[y1_bg:y2_bg, x1_bg:x2_bg]
                                    
                        is_occupied, confidence = self.classifier.predict(crop, bg_crop)
                        slot_id = slot["id"]
                        
                        # Logging state transition
                        prev_state = self.slot_status.get(slot_id, {}).get("occupied", False)
                        if is_occupied != prev_state and prev_state is not None:
                            action = "PARKED" if is_occupied else "DEPARTED"
                            self.add_log(f"Vehicle {action} in Slot {slot_id}")
                            
                        self.slot_status[slot_id] = {
                            "occupied": is_occupied,
                            "confidence": confidence
                        }
                        
            # Create an annotated overlay copy
            annotated_frame = frame.copy()
            
            # Draw overlay blocks and borders for slots
            with self.lock:
                for slot in current_slots:
                    slot_id = slot["id"]
                    status = self.slot_status.get(slot_id, {"occupied": False, "confidence": 1.0})
                    is_occupied = status["occupied"]
                    
                    # Colors: BGR
                    # Red (Occupied) / Green (Available)
                    color = (50, 50, 220) if is_occupied else (50, 200, 50)
                    
                    x1, y1, x2, y2 = slot.get("rect", [0, 0, 10, 10])
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    
                    # 1. Overlay translucent color inside slot
                    overlay = annotated_frame.copy()
                    cv2.rectangle(overlay, (x1, y1), (x2, y2), color, -1)
                    cv2.addWeighted(overlay, 0.25, annotated_frame, 0.75, 0, annotated_frame)
                    
                    # 2. Draw outline border
                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
                    
                    # 3. Add text label (ID)
                    label = f"{slot_id}"
                    cv2.putText(annotated_frame, label, (x1 + 5, y1 + 25), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
                                
            # Update the global stream frame
            self.frame_to_stream = annotated_frame
            
            # Wait for ~33ms (30fps)
            time.sleep(0.033)
            
        cap.release()

# Initialize monitor
monitor = ParkingMonitor()

@app.route("/")
def index():
    return render_template("index.html")

def generate_video_stream():
    while True:
        if monitor.frame_to_stream is not None:
            # Encode frame to JPEG
            ret, buffer = cv2.imencode('.jpg', monitor.frame_to_stream)
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.033)

@app.route("/video_feed")
def video_feed():
    return Response(generate_video_stream(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/api/slots", methods=["GET"])
def get_slots():
    with monitor.lock:
        return jsonify(monitor.slots)

@app.route("/api/slots", methods=["POST"])
def post_slots():
    data = request.json
    if not isinstance(data, list):
        return jsonify({"status": "error", "message": "Invalid coordinates payload"}), 400
        
    monitor.update_slots(data)
    return jsonify({"status": "success", "slots": monitor.slots})

@app.route("/api/detect_slots", methods=["POST"])
def detect_slots():
    with monitor.lock:
        raw_frame = monitor.last_raw_frame.copy() if monitor.last_raw_frame is not None else None
        video_source = monitor.video_source
        last_raw = monitor.last_raw_frame.copy() if monitor.last_raw_frame is not None else None
        
    if raw_frame is None:
        return jsonify({"status": "error", "message": "No active video stream frame to analyze."}), 400
        
    try:
        detected = auto_detect_slots(raw_frame)
        # Try to get clean median background frame
        bg_frame = get_median_background(video_source)
        if bg_frame is None:
            bg_frame = last_raw
            
        if bg_frame is None:
            return jsonify({"status": "error", "message": "No active video stream frame to analyze."}), 400
            
        detected = auto_detect_slots(bg_frame)
        if not detected:
            return jsonify({
                "status": "warning",
                "message": "No painted slot dividers detected. Please verify camera view or define slots manually.",
                "slots": monitor.slots
            })
            
        monitor.update_slots(detected)
        monitor.add_log(f"Auto-detected {len(detected)} parking slots using line markers.")
        return jsonify({
            "status": "success",
            "message": f"Successfully auto-detected {len(detected)} parking slots!",
            "slots": monitor.slots
        })
    except Exception as e:
        return jsonify({"status": "error", "message": f"Slot auto-detection error: {str(e)}"}), 500

@app.route("/api/status", methods=["GET"])
def get_status():
    with monitor.lock:
        current_ids = {s["id"] for s in monitor.slots}
        filtered_status = {k: v for k, v in monitor.slot_status.items() if k in current_ids}
        return jsonify(filtered_status)

@app.route("/api/stats", methods=["GET"])
def get_stats():
    with monitor.lock:
        current_ids = {s["id"] for s in monitor.slots}
        filtered_status = {k: v for k, v in monitor.slot_status.items() if k in current_ids}
        
        total = len(monitor.slots)
        occupied = sum(1 for status in filtered_status.values() if status["occupied"])
        available = total - occupied
        rate = (occupied / total * 100) if total > 0 else 0
        
        return jsonify({
            "total_slots": total,
            "occupied_slots": occupied,
            "available_slots": available,
            "occupancy_rate": round(rate, 1),
            "history": monitor.history_log
        })

@app.route("/api/upload_video", methods=["POST"])
def upload_video():
    if 'video' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400
        
    file = request.files['video']
    if file.filename == '':
        return jsonify({"status": "error", "message": "Empty filename"}), 400
        
    # Save to a unique path using timestamp to avoid Windows file sharing locks
    import time
    timestamp = int(time.time())
    save_filename = f"uploaded_video_{timestamp}.mp4"
    save_path = os.path.join(os.getcwd(), save_filename)
    
    try:
        file.save(save_path)
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to save uploaded file: {str(e)}"}), 500
    
    # Get current video source to delete it later
    old_video_source = None
    with monitor.lock:
        old_video_source = monitor.video_source
        monitor.video_source = save_path
        
    # Asynchronously delete old uploaded video files to keep directory clean
    def cleanup_old_videos(active_path, old_path):
        time.sleep(2.0) # Wait for the monitor thread to switch source and release the lock
        # Scan current directory for uploaded_video_*.mp4
        for f in os.listdir(os.getcwd()):
            if f.startswith("uploaded_video_") and f.endswith(".mp4"):
                full_f_path = os.path.join(os.getcwd(), f)
                if full_f_path != active_path:
                    try:
                        os.remove(full_f_path)
                    except Exception:
                        pass # Might still be locked briefly, ignore
        if old_path and old_path != active_path and os.path.basename(old_path).startswith("uploaded_video_"):
            try:
                os.remove(old_path)
            except Exception:
                pass
                
    threading.Thread(target=cleanup_old_videos, args=(save_path, old_video_source), daemon=True).start()
    
    monitor.add_log("Source video switched to uploaded file.")
    return jsonify({"status": "success", "message": "Video uploaded successfully"})

@app.route("/api/reset_video", methods=["POST"])
def reset_video():
    with monitor.lock:
        monitor.video_source = "parking_simulation.mp4"
    monitor.add_log("Source video reset to default simulation.")
    return jsonify({"status": "success"})

def run_training_thread():
    monitor.training_in_progress = True
    monitor.add_log("Background transfer learning training started...")
    
    try:
        # Run training script using subprocess to capture logs
        # We pass the currently active video source to train_transfer_learning.py
        process = subprocess.Popen(
            ["python", "-u", "train_transfer_learning.py", "--video_path", monitor.video_source],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        
        monitor.training_logs = ""
        while True:
            line = process.stdout.readline()
            if not line:
                break
            monitor.training_logs += line
            
        process.wait()
        
        if process.returncode == 0:
            monitor.add_log("Training completed successfully! Reloading ML model...")
            monitor.reload_model()
            monitor.add_log("New model weights loaded.")
        else:
            monitor.add_log(f"Training failed with return code {process.returncode}.")
            
    except Exception as e:
        monitor.add_log(f"Training exception: {str(e)}")
        
    finally:
        monitor.training_in_progress = False

@app.route("/api/train", methods=["POST"])
def trigger_train():
    if monitor.training_in_progress:
        return jsonify({"status": "error", "message": "Training is already in progress"}), 400
        
    threading.Thread(target=run_training_thread, daemon=True).start()
    return jsonify({"status": "success", "message": "Training initiated"})

@app.route("/api/train/status", methods=["GET"])
def train_status():
    return jsonify({
        "in_progress": monitor.training_in_progress,
        "logs": monitor.training_logs
    })

if __name__ == "__main__":
    # Start the Flask app
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
