document.addEventListener("DOMContentLoaded", () => {
    const voElements = document.querySelectorAll(".vo");
    const cursor = document.getElementById("cursor");
    const joystick = document.getElementById("joystick");
    const knob = document.createElement("div");
    knob.id = "joystick-knob";
    joystick.appendChild(knob);
    const playButton = document.getElementById("play-button");
    const prevPageButton = document.getElementById("prev-page-button");
    const nextPageButton = document.getElementById("next-page-button");
    const audioElements = {};
    const minSpeed = 0.8;
    const maxSpeed = 3.0;
    let activeAudio = null;
    let currentTarget = null;

    let cursorPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let isJoystickActive = false;
    let knobPosition = { x: 0, y: 0 }; // ノブの現在位置（相対値）
    let knobAngle = 0; // ノブの角度
    let knobDistance = 0; // ノブの距離
    let isPlaying = false;

    const SCROLL_AMOUNT = 300;

    // 音声キャッシュの準備
    voElements.forEach((element) => {
        const audioId = element.id.replace("vo", "").padStart(3, "0");
        const audio = new Audio(`voice/${audioId}.wav`);
        audioElements[element.id] = audio;
    });

    // ポインタの描画更新
    function updateCursor() {
        cursor.style.left = `${cursorPosition.x - cursor.offsetWidth / 2}px`;
        cursor.style.top = `${cursorPosition.y - cursor.offsetHeight / 2}px`;

        const target = document.elementFromPoint(cursorPosition.x, cursorPosition.y);
        if (target && target.classList.contains("vo") && target !== currentTarget) {
            playAudio(target);
        }
    }

    // 再生処理
    function playAudio(target) {
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0;
        }
        if (currentTarget) {
            currentTarget.classList.remove("playing");
        }
        const audioId = target.id;
        const audio = audioElements[audioId];
        if (!audio) return;

        activeAudio = audio;
        currentTarget = target;
        target.classList.add("playing");
        audio.currentTime = 0;
        if (isPlaying) audio.play();
    }

    // ノブの動作を監視してポインタを動かす
    function moveCursor() {
        if (isJoystickActive && knobDistance > 0) {
            // ノブの角度に基づいてカーソルを移動
            const speed = Math.min(knobDistance / 10, 10); // スピードを制限
            cursorPosition.x = Math.min(
                window.innerWidth,
                Math.max(0, cursorPosition.x + Math.cos(knobAngle) * speed)
            );
            cursorPosition.y = Math.min(
                window.innerHeight,
                Math.max(0, cursorPosition.y + Math.sin(knobAngle) * speed)
            );
            updateCursor();
        }

        // 次のフレームで再度呼び出し
        requestAnimationFrame(moveCursor);
    }

    // ノブの移動処理
    function startJoystickControl(event) {
        isJoystickActive = true;

        const joystickRect = joystick.getBoundingClientRect();
        const centerX = joystickRect.left + joystickRect.width / 2;
        const centerY = joystickRect.top + joystickRect.height / 2;

        const moveJoystick = (moveEvent) => {
            const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

            const dx = clientX - centerX;
            const dy = clientY - centerY;
            const distance = Math.min(
                Math.sqrt(dx * dx + dy * dy),
                joystickRect.width / 2 - knob.offsetWidth / 2
            );
            const angle = Math.atan2(dy, dx);

            // ノブの位置を更新
            knob.style.left = `${50 + (distance * Math.cos(angle)) / (joystickRect.width / 2) * 100}%`;
            knob.style.top = `${50 + (distance * Math.sin(angle)) / (joystickRect.height / 2) * 100}%`;

            // ノブの状態を保存
            knobPosition = { x: dx, y: dy };
            knobAngle = angle;
            knobDistance = distance;
        };

        const stopJoystickControl = () => {
            isJoystickActive = false;
            knob.style.left = "50%";
            knob.style.top = "50%";
            knobPosition = { x: 0, y: 0 };
            knobAngle = 0;
            knobDistance = 0;
            document.removeEventListener("mousemove", moveJoystick);
            document.removeEventListener("mouseup", stopJoystickControl);
            document.removeEventListener("touchmove", moveJoystick);
            document.removeEventListener("touchend", stopJoystickControl);
        };

        document.addEventListener("mousemove", moveJoystick);
        document.addEventListener("mouseup", stopJoystickControl);
        document.addEventListener("touchmove", moveJoystick);
        document.addEventListener("touchend", stopJoystickControl);
    }

    joystick.addEventListener("mousedown", startJoystickControl);
    joystick.addEventListener("touchstart", startJoystickControl);

    // 再生ボタンの操作
    playButton.addEventListener("mousedown", () => {
        isPlaying = true;
        if (activeAudio) activeAudio.play();
    });

    playButton.addEventListener("mouseup", () => {
        isPlaying = false;
        if (activeAudio) activeAudio.pause();
    });

    // スクロールボタンの操作
    prevPageButton.addEventListener("click", () => {
        const book = document.querySelector(".book");
        book.scrollBy({
            left: SCROLL_AMOUNT,
            behavior: "smooth",
        });
    });

    nextPageButton.addEventListener("click", () => {
        const book = document.querySelector(".book");
        book.scrollBy({
            left: -SCROLL_AMOUNT,
            behavior: "smooth",
        });
    });

    // カーソルの動作を開始
    moveCursor();
});
