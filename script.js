import { ScrambleDisplay } from './node_modules/scramble-display/dist/esm/index.js';

class RubikTimer {
    constructor() {
        this.timerDisplay = document.getElementById("timer");
        this.pbDisplay = document.getElementById("pb");
        this.timeList = document.getElementById("timeList");
        this.scrambleDisplay = document.getElementById("scrambleDisplay");
        this.visualizationToggle = document.getElementById("visualizationToggle");

        this.state = "idle";
        this.inspectionTime = 15;
        this.holdStartTime = 0;
        this.timing = { startTime: 0, elapsedTime: 0 };

        this.inspectionInterval = null;
        this.timerInterval = null;

        this.history = JSON.parse(localStorage.getItem("cubeHistory")) || [];
        this.pb = Number.parseFloat(localStorage.getItem("cubePB")) || null;

        this.moves = ["R", "R'", "R2", "L", "L'", "L2", "U", "U'", "U2", "D", "D'", "D2", "F", "F'", "F2", "B", "B'", "B2"];

        this.solveDetailModal = new bootstrap.Modal(document.getElementById('solveDetailModal'));
        this.setupModalEvents();

        this.colorChangeTimeout = null;
        this.currentSolveIndex = null;  // Thêm biến để lưu index của solve hiện tại

        this.init();
    }

    init() {
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
        this.updatePBDisplay();
        this.loadHistory();
        this.generateScramble();
        this.initVisualizationToggle();
    }

    initVisualizationToggle() {
        this.visualizationToggle.addEventListener("change", () => {
            const visualization = this.visualizationToggle.checked ? "3D" : "2D";
            this.scrambleDisplay.setAttribute("visualization", visualization);
        });
    }

    generateScramble() {
        const scramble = [];
        let lastMove = "";

        for (let i = 0; i < 20; i++) {
            let move;
            do {
                move = this.moves[Math.floor(Math.random() * this.moves.length)];
            } while (move.charAt(0) === lastMove.charAt(0));

            scramble.push(move);
            lastMove = move;
        }

        const scrambleStr = scramble.join(" ");
        document.getElementById("scrambleText").textContent = scrambleStr;
        this.scrambleDisplay.setAttribute("scramble", scrambleStr);
    }

    handleKeyDown(event) {
        if (event.code === "Space" && !event.repeat) {
            event.preventDefault();
            this.holdStartTime = Date.now(); // Thêm dòng này để bắt đầu tính thời gian giữ
            if (this.state === "idle") {
                this.timerDisplay.style.color = "yellow";
                clearTimeout(this.colorChangeTimeout);
                this.colorChangeTimeout = setTimeout(() => {
                    if (this.state === "idle") {
                        this.timerDisplay.style.color = "orange";
                    }
                }, 500);
            } else if (this.state === "inspecting") {
                this.timerDisplay.style.color = "yellow";
                clearTimeout(this.colorChangeTimeout);
                this.colorChangeTimeout = setTimeout(() => {
                    if (this.state === "inspecting") {
                        this.timerDisplay.style.color = "orange";
                        this.prepareTimer();
                    }
                }, 500);
            }
        }
    }

    handleKeyUp(event) {
        if (event.code === "Space") {
            clearTimeout(this.colorChangeTimeout);
            const holdDuration = Date.now() - this.holdStartTime;
            
            // Nếu đang ở trạng thái idle, kiểm tra 50ms
            if (this.state === "idle" && holdDuration < 50) {
                this.timerDisplay.style.color = "";
                return;
            }
            
            // Nếu đang ở trạng thái inspecting, kiểm tra 100ms
            if (this.state === "inspecting" && holdDuration < 100) {
                this.timerDisplay.style.color = "red";
                return;
            }

            if (this.state === "idle") {
                this.startInspection();
            } else if (this.state === "inspecting" && this.holdStartTime > 0) {
                this.startTimer();
                this.holdStartTime = 0;
            } else if (this.state === "timing") {
                this.stopTimer();
            }
        }
    }

    startInspection() {
        if (this.state !== "idle") return;
        this.state = "inspecting";
        this.inspectionTime = 15;
        this.timerDisplay.style.color = "red";
        this.timerDisplay.textContent = this.inspectionTime.toFixed(0);
        this.inspectionInterval = setInterval(() => {
            this.inspectionTime--;
            if (this.inspectionTime <= 0) {
                this.resetTimer();
            } else {
                this.timerDisplay.textContent = this.inspectionTime.toFixed(0);
            }
        }, 1000);
    }

    prepareTimer() {
        if (this.state !== "inspecting") return;
        const holdDuration = Date.now() - this.holdStartTime;
        if (holdDuration >= 100) {
            this.holdStartTime = Date.now();
            this.timerDisplay.classList.add("ready");
        }
    }

    startTimer() {
        if (this.state !== "inspecting" || Date.now() - this.holdStartTime < 300) return;
        this.state = "timing";
        this.timing.startTime = Date.now();
        this.timing.elapsedTime = 0;
        clearInterval(this.inspectionInterval);
        this.timerDisplay.style.color = "lime";
        this.timerDisplay.classList.remove("ready");
        this.timerInterval = requestAnimationFrame(this.updateTimer.bind(this));
    }

    updateTimer() {
        if (this.state !== "timing") return;
        const now = Date.now();
        this.timing.elapsedTime = (now - this.timing.startTime) / 1000;
        this.timerDisplay.textContent = this.timing.elapsedTime.toFixed(3);
        this.timerInterval = requestAnimationFrame(this.updateTimer.bind(this));
    }

    stopTimer() {
        if (this.state !== "timing") return;
        cancelAnimationFrame(this.timerInterval);
        this.state = "idle";
        const finalTime = this.timing.elapsedTime;
        this.saveTime(finalTime);
        this.generateScramble();
    }

    resetTimer() {
        this.state = "idle";
        this.timerDisplay.style.color = "";
        this.timerDisplay.textContent = "0.000";
        clearInterval(this.inspectionInterval);
        cancelAnimationFrame(this.timerInterval);
        this.holdStartTime = 0;
        this.generateScramble();
    }

    updateInspectionDisplay() {
        this.inspectionDisplay.textContent = this.inspectionTime;
    }

    saveTime(time) {
        const timeRecord = {
            time: time,
            date: new Date().toISOString(),
            scramble: document.getElementById("scrambleText").textContent,
        };
        this.history.unshift(timeRecord);
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }
        localStorage.setItem("cubeHistory", JSON.stringify(this.history));
        if (!this.pb || time < this.pb) {
            this.pb = time;
            localStorage.setItem("cubePB", time.toString());
            this.updatePBDisplay();
        }
        this.loadHistory();
    }

    updatePBDisplay() {
        this.pbDisplay.textContent = this.pb ? this.pb.toFixed(3) : "-";
    }

    loadHistory() {
        this.timeList.innerHTML = "";
        this.history.slice(0, 10).forEach((record, index) => {
            const timeElement = document.createElement("div");
            const timeClass = this.getTimeClass(record.time);
            timeElement.classList.add(timeClass);
            timeElement.innerHTML = `<span><span class="num_list">${index + 1}. </span> ${record.time.toFixed(2)}s</span>`;
            timeElement.addEventListener('click', () => this.showSolveDetail(record));
            this.timeList.appendChild(timeElement);
        });
    }

    setupModalEvents() {
        document.querySelector('.copy-scramble').addEventListener('click', () => {
            const scramble = document.querySelector('.solve-scramble').textContent;
            navigator.clipboard.writeText(scramble);
        });

        document.querySelector('.delete-solve').addEventListener('click', () => {
            this.deleteSolve();
        });
    }

    deleteSolve() {
        if (this.currentSolveIndex === null) return;
        
        // Xóa thành tích khỏi history
        const deletedTime = this.history[this.currentSolveIndex].time;
        this.history.splice(this.currentSolveIndex, 1); // Sửa từ this.history.splice(this.currentSolveIndex, 0) thành this.history.splice(this.currentSolveIndex, 1)
        localStorage.setItem("cubeHistory", JSON.stringify(this.history));

        // Nếu xóa PB, tìm PB mới
        if (Math.abs(deletedTime - this.pb) < 0.001) {
            this.pb = this.history.length > 0 ? Math.min(...this.history.map(record => record.time)) : null;
            localStorage.setItem("cubePB", this.pb ? this.pb.toString() : "");
            this.updatePBDisplay();
        }

        // Cập nhật lại danh sách
        this.loadHistory();
        
        // Đóng modal
        this.solveDetailModal.hide();
    }

    getTimeClass(time) {
        // Return normal if no PB or invalid time
        if (!this.pb || !time) return 'normal';
        
        // Find fastest and slowest times in history
        const fastestTime = Math.min(...this.history.map(record => record.time));
        const slowestTime = Math.max(...this.history.map(record => record.time));
        
        // If this is the fastest time
        if (Math.abs(time - fastestTime) < 0.001) return 'fast';
        // If this is the slowest time
        if (Math.abs(time - slowestTime) < 0.001) return 'slow';
        // Otherwise normal
        return 'normal';
    }

    formatDateTime(dateStr) {
        const date = new Date(dateStr);
        const time = date.toLocaleTimeString('vi-VN', { hour: 'numeric', minute: '2-digit' });
        const fullDate = date.toLocaleDateString('vi-VN', { 
            day: 'numeric', 
            month: 'numeric', 
            year: 'numeric'
        });
        return `${time} | Ngày ${fullDate}`;
    }

    showSolveDetail(solve) {
        this.currentSolveIndex = this.history.findIndex(
            record => record.time === solve.time && record.date === solve.date
        );
        
        const modalTime = document.querySelector('.solve-time');
        const modalDateTime = document.querySelector('.solve-datetime');
        const modalScramble = document.querySelector('.solve-scramble');
        const modalScrambleDisplay = document.querySelector('.solve-scramble-display scramble-display');

        modalTime.textContent = solve.time.toFixed(2);
        modalTime.className = 'solve-time';
        modalTime.classList.add(this.getTimeClass(solve.time));
        
        modalDateTime.textContent = this.formatDateTime(solve.date);
        modalScramble.textContent = solve.scramble;
        modalScrambleDisplay.setAttribute('scramble', solve.scramble);

        this.solveDetailModal.show();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new RubikTimer();
});
