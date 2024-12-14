document.addEventListener("DOMContentLoaded", () => {
    const voElements = document.querySelectorAll(".vo"); // ターゲット要素
    const book = document.querySelector(".book");
    const audioElements = {}; // 音声キャッシュ用
    let lastPosition = null; // 前回の座標
    let lastTime = null; // 前回の時間
    let activeAudio = null; // 現在再生中の音声
    let currentTarget = null; // 現在のターゲット要素

    voElements.forEach((element) => {
        const audioId = element.id.replace("vo", "").padStart(3, "0");
        const audio = new Audio(`voice/${audioId}.wav`);
        audioElements[element.id] = audio; // 音声キャッシュ
    });

    // 再生処理
    function playAudio(target) {
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0; // 現在の音声を停止
        }
        const audioId = target.id;
        const audio = audioElements[audioId];
        if (!audio) return;

        activeAudio = audio;
        audio.currentTime = 0; // 音声を最初から再生
        audio.play();
    }

    // ポインタが要素に触れたとき
    book.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        const target = document.elementFromPoint(e.clientX, e.clientY);

        if (target && target.classList.contains("vo")) {
            lastPosition = { x: e.clientX, y: e.clientY };
            lastTime = performance.now();
            currentTarget = target;
            playAudio(target); // 初回再生
        }
    });

    // ポインタが移動したとき
    book.addEventListener("pointermove", (e) => {
        if (!lastPosition || !lastTime) return;

        const target = document.elementFromPoint(e.clientX, e.clientY);

        if (target && target.classList.contains("vo") && target !== currentTarget) {
            currentTarget = target;
            playAudio(target); // 新しい要素の音声を再生
        }

        const currentTime = performance.now();
        const currentPosition = { x: e.clientX, y: e.clientY };

        // 移動距離と時間差からスピードを計算
        const distance = Math.sqrt(
            Math.pow(currentPosition.x - lastPosition.x, 2) +
            Math.pow(currentPosition.y - lastPosition.y, 2)
        );
        const deltaTime = currentTime - lastTime;
        const speed = distance / deltaTime * 1000;

        // 再生速度を調整 (0.8〜3倍速の範囲)
        if (activeAudio) {
            activeAudio.playbackRate = Math.min(3, Math.max(0.8, speed / 300));
        }

        // 現在の位置と時間を記録
        lastPosition = currentPosition;
        lastTime = currentTime;
    });

    // ポインタが離れたとき
    book.addEventListener("pointerup", () => {
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0; // 再生位置をリセット
            activeAudio = null;
        }
        lastPosition = null;
        lastTime = null;
        currentTarget = null;
    });

    // ポインタがキャンセルされたとき
    book.addEventListener("pointercancel", () => {
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0; // 再生位置をリセット
            activeAudio = null;
        }
        lastPosition = null;
        lastTime = null;
        currentTarget = null;
    });
});
