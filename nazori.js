document.addEventListener("DOMContentLoaded", () => {
    const voElements = document.querySelectorAll(".vo");
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

    // 再生処理
    function playAudio(target) {
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0; // 現在の音声を停止
        }
        if (currentTarget) {
            currentTarget.classList.remove("playing"); // 前のターゲットのハイライトを解除
        }
        const audioId = target.id;
        const audio = audioElements[audioId];
        if (!audio) return;

        activeAudio = audio;
        currentTarget = target; // 現在のターゲットを更新
        target.classList.add("playing"); // 新しいターゲットにハイライト
        audio.currentTime = 0; // 音声を最初から再生
        audio.play();
    }

    // 指の速さを計算して再生速度を調整
    function adjustPlaybackRate(currentPosition, currentTime) {
        if (!lastPosition || !lastTime) return; // 初回の計算をスキップ

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

        // 現在の位置と時間を記録
        lastPosition = currentPosition;
        lastTime = currentTime;
    }

    // ポインタが要素に触れたとき
    document.addEventListener("pointerdown", (e) => {
        const target = document.elementFromPoint(e.clientX, e.clientY);

        if (target && target.classList.contains("vo")) {
            playAudio(target); // 初回再生
        }

        // タッチ開始位置と時間を記録
        lastPosition = { x: e.clientX, y: e.clientY };
        lastTime = performance.now();
    });

    // ポインタが移動したとき
    document.addEventListener("pointermove", (e) => {
        adjustPlaybackRate({ x: e.clientX, y: e.clientY }, performance.now());

        const target = document.elementFromPoint(e.clientX, e.clientY);

        // 次の要素に移動した場合
        if (target && target.classList.contains("vo") && target !== currentTarget) {
            playAudio(target);
        }
    });

    // ポインタが離れたとき
    document.addEventListener("pointerup", () => {
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
    });

    // ポインタがキャンセルされたとき
    document.addEventListener("pointercancel", () => {
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
    });
});
