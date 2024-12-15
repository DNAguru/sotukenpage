document.addEventListener("DOMContentLoaded", () => {
    const voElements = document.querySelectorAll(".vo"); // 対象要素
    const audioElements = {}; // 音声キャッシュ用
    let activeAudio = null; // 現在再生中の音声
    let currentTarget = null; // 現在のターゲット要素
    let lastPosition = null; // 前回の座標
    let lastTime = null; // 前回の時間

    const minSpeed = 0.8; // 最低再生速度
    const maxSpeed = 3.0; // 最大再生速度

    // 音声キャッシュの準備
    voElements.forEach((element) => {
        const audioId = element.id.replace("vo", "").padStart(3, "0");
        const audio = new Audio(`voice/${audioId}.wav`);
        audioElements[element.id] = audio;
    });

    // タッチ位置に対応する要素を再生
    function playAudio(target) {
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0; // 現在の音声を停止
        }
        if (currentTarget) {
            currentTarget.classList.remove("playing"); // ハイライトを解除
        }
        const audioId = target.id;
        const audio = audioElements[audioId];
        if (!audio) return;

        activeAudio = audio;
        currentTarget = target; // 現在のターゲットを更新
        target.classList.add("playing"); // ハイライトを追加
        audio.currentTime = 0; // 音声を最初から再生
        audio.play();
    }

    // 指の速さを計算して再生速度を調整
    function adjustPlaybackRate(currentPosition, currentTime) {
        if (!lastPosition || !lastTime) return;

        const dx = currentPosition.x - lastPosition.x;
        const dy = currentPosition.y - lastPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy); // 移動距離
        const deltaTime = currentTime - lastTime; // 経過時間

        if (deltaTime > 0) {
            const speed = distance / deltaTime * 1000; // ピクセル/秒の速度
            const playbackRate = Math.min(maxSpeed, Math.max(minSpeed, speed / 300)); // 再生速度を制限範囲に調整
            if (activeAudio) {
                activeAudio.playbackRate = playbackRate; // 再生速度を設定
            }
        }

        lastPosition = { ...currentPosition }; // 現在の座標を更新
        lastTime = currentTime; // 現在の時間を更新
    }

    // `touchstart` イベント
    function startInteraction(event) {
        event.preventDefault();
        const startEvent = event.touches[0];
        const target = document.elementFromPoint(startEvent.clientX, startEvent.clientY);

        if (target && target.classList.contains("vo")) {
            playAudio(target); // 初回再生
        }

        lastPosition = { x: startEvent.clientX, y: startEvent.clientY };
        lastTime = performance.now();
    }

    // `touchmove` イベント
    function moveInteraction(event) {
        event.preventDefault();
        const moveEvent = event.touches[0];

        adjustPlaybackRate({ x: moveEvent.clientX, y: moveEvent.clientY }, performance.now());

        const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);

        // 別の要素に移動した場合
        if (target && target.classList.contains("vo") && target !== currentTarget) {
            playAudio(target);
        }
    }

    // `touchend` イベント
    function endInteraction() {
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0; // 再生位置をリセット
        }
        if (currentTarget) {
            currentTarget.classList.remove("playing"); // ハイライトを解除
        }
        activeAudio = null;
        currentTarget = null;
        lastPosition = null;
        lastTime = null;
    }

    // イベントリスナーを追加（touchのみ対応）
    document.addEventListener("touchstart", startInteraction, { passive: false });
    document.addEventListener("touchmove", moveInteraction, { passive: false });
    document.addEventListener("touchend", endInteraction);
});
