document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const sessionInfoElement = document.getElementById('session-info');
    const pickBtn = document.getElementById('pick-btn');

    // Cards
    const foodCardContainer = document.getElementById('food-card-container');
    const foodCard = foodCardContainer.querySelector('.flip-card');
    const foodResult = document.getElementById('food-result');

    const drinkCardContainer = document.getElementById('drink-card-container');
    const drinkCard = drinkCardContainer.querySelector('.flip-card');
    const drinkResult = document.getElementById('drink-result');

    const includeDrinkCheckbox = document.getElementById('include-drink');
    const toastContainer = document.getElementById('toast-container');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const toggleHistoryBtn = document.getElementById('toggle-history-btn');
    const historySidebar = document.getElementById('history-sidebar');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmOkBtn = document.getElementById('confirm-ok');
    const confirmCancelBtn = document.getElementById('confirm-cancel');

    // EMBEDDED DATA
    const foodData = {
        "morning": [
            "Bánh mì chả cá",
            "Cơm gà sv",
            "Bánh bao không",
            "Xôi lá cẩm",
            "Bánh mì que",
            "Xôi bắp",
            "Bánh bao nhân chay",
            "Bánh ướt",
            "Bánh mì bơ",
            "Cơm mỡ",
            "Bánh mì thịt",
            "Cơm sườn",
            "Bún thịt nướng",
            "Mì gói"
        ],
        "noon": [
            "Cơm mỡ",
            "Cơm thập cẩm sinh viên",
            "Cơm sườn",
            "Cơm phần",
            "Cơm gà sốt thái",
            "Bánh mì chả cá",
            "Cơm gà chiên xù",
            "Bánh mì thịt",
            "Cơm gà sốt chua ngọt",
            "Cơm gà sinh viên",
            "Cơm bò sinh viên"
        ],
        "afternoon": [
            "Cơm mỡ",
            "Cơm thập cẩm sinh viên",
            "Cơm sườn",
            "Cơm phần",
            "Cơm gà sốt thái",
            "Mì gói",
            "Cơm gà chiên xù",
            "Cơm gà sốt chua ngọt",
            "Cơm gà sinh viên",
            "Cơm bò sinh viên"
        ],
        "drinks": [
            "Bạc sỉu",
            "Cà phê sữa",
            "Matcha Latte",
            "Khoai Môn Latter",
            "Nước suối",
            "Cà phê gói",
            "Nước trái cây",
            "Trà dâu"
        ]
    };

    let currentSession = '';

    console.log("App ready.");
    updateTime();
    loadHistory();

    // History Management
    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('foodHistory') || '[]');
        renderHistory(history);
    }

    function saveToHistory(food, drink = null) {
        let history = JSON.parse(localStorage.getItem('foodHistory') || '[]');
        const now = new Date();
        const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

        const entry = {
            food: food,
            drink: drink,
            time: timeStr,
            timestamp: now.getTime()
        };

        history.unshift(entry);
        history = history.slice(0, 5); // Keep only last 5
        localStorage.setItem('foodHistory', JSON.stringify(history));
        renderHistory(history);
    }

    function renderHistory(history) {
        if (history.length === 0) {
            historyList.innerHTML = '<p class="history-empty">Chưa có lịch sử</p>';
            return;
        }

        historyList.innerHTML = history.map(entry => `
            <div class="history-item">
                <div class="history-item-content">
                    <i class="fa-solid fa-utensils history-item-icon"></i>
                    <span class="history-item-text">${entry.food}${entry.drink ? ' + ' + entry.drink : ''}</span>
                </div>
                <span class="history-item-time">${entry.time}</span>
            </div>
        `).join('');
    }

    // Handle Checkbox Toggles for visibility
    includeDrinkCheckbox.addEventListener('change', () => {
        if (includeDrinkCheckbox.checked) {
            drinkCardContainer.classList.remove('hidden');
        } else {
            drinkCardContainer.classList.add('hidden');
            // Reset flipping
            drinkCard.classList.remove('flipped');
        }
    });

    // Clear History Button
    clearHistoryBtn.addEventListener('click', () => {
        showConfirmModal();
    });

    // Confirmation Modal
    function showConfirmModal() {
        confirmModal.classList.add('show');
    }

    function hideConfirmModal() {
        confirmModal.classList.remove('show');
    }

    confirmOkBtn.addEventListener('click', () => {
        localStorage.removeItem('foodHistory');
        loadHistory();
        showToast('Đã xóa lịch sử', 'success');
        hideConfirmModal();
    });

    confirmCancelBtn.addEventListener('click', () => {
        hideConfirmModal();
    });

    // Close modal on backdrop click
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            hideConfirmModal();
        }
    });

    // Toggle History Sidebar
    toggleHistoryBtn.addEventListener('click', () => {
        historySidebar.classList.toggle('open');
    });

    // Time & Session Logic
    function updateTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const currentTimeInMinutes = hours * 60 + minutes;

        // Morning: 5:00 (300) - 9:30 (570)
        // Noon: 9:31 (571) - 14:30 (870)
        // Afternoon: 14:31 (871) - End

        let sessionDisplay = '';
        let newSession = '';

        if (currentTimeInMinutes >= 300 && currentTimeInMinutes <= 570) {
            newSession = 'morning';
            sessionDisplay = 'BUỔI SÁNG (5:00 - 9:30)';
        } else if (currentTimeInMinutes > 570 && currentTimeInMinutes <= 870) {
            newSession = 'noon';
            sessionDisplay = 'BUỔI TRƯA (9:31 - 14:30)';
        } else {
            newSession = 'afternoon';
            sessionDisplay = 'BUỔI CHIỀU TỐI (14:31 trở đi)';
        }

        currentSession = newSession;
        clockElement.textContent = formatTime(hours, minutes, seconds);
        sessionInfoElement.textContent = sessionDisplay;
    }

    function formatTime(h, m, s) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    // Update clock every second
    setInterval(updateTime, 1000);

    // Random Logic
    pickBtn.addEventListener('click', () => {
        // Validation: Session Valid?
        if (!foodData[currentSession]) {
            showToast('Không tìm thấy dữ liệu cho khung giờ này!', 'error');
            return;
        }

        // Prevent spam with cooldown
        if (pickBtn.disabled) return;

        // Disable button and start cooldown
        pickBtn.disabled = true;
        let countdown = 3.5;
        const timerSpan = document.createElement('span');
        timerSpan.className = 'cooldown-timer';
        timerSpan.textContent = `${countdown.toFixed(1)}s`;
        pickBtn.appendChild(timerSpan);

        const countdownInterval = setInterval(() => {
            countdown -= 0.1;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                pickBtn.disabled = false;
                timerSpan.remove();
            } else {
                timerSpan.textContent = `${countdown.toFixed(1)}s`;
            }
        }, 100);

        // Add button animation
        pickBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            pickBtn.style.transform = '';
        }, 100);

        // RESET State: Remove previous animations
        foodCard.classList.remove('flipped', 'animate-dramatic');
        if (includeDrinkCheckbox.checked) {
            drinkCard.classList.remove('flipped', 'animate-dramatic');
        }

        // Small delay then trigger dramatic animation
        setTimeout(() => {
            performDramaticReveal();
        }, 100);
    });

    function performDramaticReveal() {
        // Pick Food
        const foodList = foodData[currentSession];
        if (foodList && foodList.length > 0) {
            const randomFood = foodList[Math.floor(Math.random() * foodList.length)];
            let selectedDrink = null;

            // Pick Drink (Optional)
            if (includeDrinkCheckbox.checked) {
                const drinkList = foodData['drinks'];
                if (drinkList && drinkList.length > 0) {
                    selectedDrink = drinkList[Math.floor(Math.random() * drinkList.length)];
                }
            }

            // Trigger dramatic animation first (without revealing text yet)
            foodCard.classList.add('animate-dramatic');
            if (selectedDrink) {
                setTimeout(() => {
                    drinkCard.classList.add('animate-dramatic');
                }, 200);
            }

            // After animation completes, set text and flip the card
            setTimeout(() => {
                foodResult.textContent = randomFood;
                foodCard.classList.remove('animate-dramatic');
                foodCard.classList.add('flipped');

                if (selectedDrink) {
                    drinkResult.textContent = selectedDrink;
                    drinkCard.classList.remove('animate-dramatic');
                    drinkCard.classList.add('flipped');
                }

                // Save to history
                saveToHistory(randomFood, selectedDrink);
                triggerConfetti();
            }, 2000);

        } else {
            foodResult.textContent = "Chưa có món";
            showToast('Danh sách món ăn trống!', 'info');
        }
    }

    // Confetti Effect
    function triggerConfetti() {
        if (typeof confetti === 'function') {
            const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

            // Multiple bursts for more impact
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.6, x: 0.5 },
                colors: colors,
                disableForReducedMotion: true,
                startVelocity: 30,
                gravity: 0.8,
                scalar: 1.2
            });

            // Second burst with delay
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    spread: 80,
                    origin: { y: 0.65, x: 0.5 },
                    colors: colors,
                    disableForReducedMotion: true,
                    startVelocity: 25,
                    gravity: 0.9
                });
            }, 150);
        }
    }

    // Custom Toast Notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';
        if (type === 'warning') icon = '⚠️';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
});
