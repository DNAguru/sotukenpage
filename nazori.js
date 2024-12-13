document.addEventListener("DOMContentLoaded", () => {
    const voElements = document.querySelectorAll(".vo"); // ターゲット要素
    const hoverPreview = document.getElementById("hover-preview");
    const book = document.querySelector(".book");
    const audioElements = {}; // 音声キャッシュ用
    let lastPosition = null; // 前回の座標
    let lastTime = null; // 前回の時間
    let activeAudio = null; // 現在再生中の音声

    voElements.forEach((element) => {
        const audioId = element.id.replace("vo", "").padStart(3, "0");
        const audio = new Audio(`voice/${audioId}.wav`);
        audioElements[element.id] = audio; // 音声キャッシュ

        // ポインタが要素に触れたとき
        element.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            lastPosition = { x: e.clientX, y: e.clientY }; // 初期位置記録
            lastTime = performance.now(); // 初期時間記録
            activeAudio = audio;
            audio.currentTime = 0; // 音声を最初から再生
            audio.play();
        });

        // ポインタが移動したとき
        element.addEventListener("pointermove", (e) => {
            if (!lastPosition || !lastTime || !activeAudio) return;

            const currentTime = performance.now(); // 現在の時間
            const currentPosition = { x: e.clientX, y: e.clientY }; // 現在の位置

            // 移動距離を計算
            const distance = Math.sqrt(
                Math.pow(currentPosition.x - lastPosition.x, 2) +
                Math.pow(currentPosition.y - lastPosition.y, 2)
            );

            // 経過時間を計算
            const deltaTime = currentTime - lastTime;

            // スピード (ピクセル/秒) を計算
            const speed = distance / deltaTime * 1000;

            // 再生速度をスピードに基づいて調整 (1〜3倍速の範囲で制限)
            activeAudio.playbackRate = Math.min(3, Math.max(0.8, speed / 300));

            // 現在の位置と時間を記録
            lastPosition = currentPosition;
            lastTime = currentTime;
        });

        // ポインタが離れたとき
        element.addEventListener("pointerup", () => {
            if (activeAudio) {
                activeAudio.pause();
                activeAudio.currentTime = 0; // 再生位置をリセット
                activeAudio = null;
            }
            lastPosition = null;
            lastTime = null;
        });

        // ポインタがキャンセルされたとき
        element.addEventListener("pointercancel", () => {
            if (activeAudio) {
                activeAudio.pause();
                activeAudio.currentTime = 0; // 再生位置をリセット
                activeAudio = null;
            }
            lastPosition = null;
            lastTime = null;
        });

        element.addEventListener("mouseenter", (e) => {
            // マウスホバーで拡大テキストを表示
            hoverPreview.style.display = "block";
            hoverPreview.textContent = e.target.textContent;
        });

        element.addEventListener("mousemove", (e) => {
            const viewportWidth = window.innerWidth; // ビューポートの幅
            const viewportHeight = window.innerHeight; // ビューポートの高さ
            const previewWidth = hoverPreview.offsetWidth; // プレビューの幅
            const previewHeight = hoverPreview.offsetHeight; // プレビューの高さ
            const bookRect = book.getBoundingClientRect(); // book 要素の位置とサイズ

            // X座標の計算 (マウス左側に表示、bookの左端に基づく)
            let leftPosition = e.pageX - previewWidth - 20;
            if (leftPosition < bookRect.left) {
                // book の左端を超えないよう調整
                leftPosition = bookRect.left + 10;
            }

            // Y座標の計算 (画面下端を超えないように)
            let topPosition = e.pageY + 20;
            if (topPosition + previewHeight > viewportHeight) {
                // プレビューが画面下を超える場合
                topPosition = viewportHeight - previewHeight - 10;
            }

            // タブレット対応 (小画面で右側に回避)
            if (viewportWidth <= 768 && leftPosition < 100) {
                leftPosition = e.pageX + 20; // マウス右側に配置
            }

            // 計算結果を適用
            hoverPreview.style.left = `${leftPosition}px`;
            hoverPreview.style.top = `${topPosition}px`;
        });

        element.addEventListener("mouseleave", () => {
            // ホバーが外れたらプレビューを非表示
            hoverPreview.style.display = "none";
        });

    });
});
