document.addEventListener("DOMContentLoaded", () => {
    const voElements = document.querySelectorAll(".vo");
    const cursor = document.getElementById("cursor");
    const joystick = document.getElementById("joystick");
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
    let joystickOffset = { x: 0, y: 0 };
    let isPlaying = false;

    // スクロール量（1回のボタン操作で移動する距離）
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

    // ジョイスティックの動作
    function moveCursor() {
        if (isJoystickActive) {
            cursorPosition.x = Math.min(
                window.innerWidth,
                Math.max(0, cursorPosition.x + joystickOffset.x / 10)
            );
            cursorPosition.y = Math.min(
                window.innerHeight,
                Math.max(0, cursorPosition.y + joystickOffset.y / 10)
            );
            updateCursor();
            requestAnimationFrame(moveCursor);
        }
    }

    joystick.addEventListener("mousedown", (e) => {
        isJoystickActive = true;
        const rect = joystick.getBoundingClientRect();
        joystickOffset.x = e.clientX - (rect.left + rect.width / 2);
        joystickOffset.y = e.clientY - (rect.top + rect.height / 2);
        moveCursor();
    });

    joystick.addEventListener("mouseup", () => {
        isJoystickActive = false;
        joystickOffset = { x: 0, y: 0 };
    });

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
            top: -SCROLL_AMOUNT,
            behavior: "smooth",
        });
    });

    nextPageButton.addEventListener("click", () => {
        const book = document.querySelector(".book");
        book.scrollBy({
            top: SCROLL_AMOUNT,
            behavior: "smooth",
        });
    });

    updateCursor();
});
