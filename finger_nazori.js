document.addEventListener("DOMContentLoaded", () => {
    const voElements = Array.from(document.querySelectorAll(".vo")); // vo要素を配列に変換
    const audioElements = {}; // 音声キャッシュ用
    let isSwiping = false; // スワイプ中かどうか
    let currentAudioIndex = -1; // 現在再生中のvo要素のインデックス
    let playbackSpeed = 1.0; // 再生速度
    let swipeStartIndex = -1; // スワイプを開始したvo要素のインデックス
    let lastTouchPosition = null; // 前回のタッチ位置
    let lastTouchTime = null; // 前回のタッチ時間

    const SPEED_SCALING_FACTOR = 10; // 再生速度スケーリング係数
    const MIN_PLAYBACK_SPEED = 0.8; // 最低再生速度
    const MAX_PLAYBACK_SPEED = 5.0; // 最大再生速度

    const SCROLL_PADDING = 10; // スクロールの余白（ピクセル）

    // 音声キャッシュの準備
    voElements.forEach((element, index) => {
        const audioId = element.id.replace("vo", "").padStart(3, "0");
        const audio = new Audio(`voice/${audioId}.wav`);
        audio.preload = "auto"; // 音声を事前に読み込む
        audioElements[index] = audio;
    });

    // 音声を再生し、ハイライトを更新
    function playAudio(index) {
        if (index < 0 || index >= voElements.length) return; // 範囲外は無視
        if (currentAudioIndex === index) return; // 既に再生中なら無視

        // 前回の再生中の音声を停止
        if (currentAudioIndex !== -1) {
            audioElements[currentAudioIndex].pause();
            audioElements[currentAudioIndex].currentTime = 0;
            voElements[currentAudioIndex].classList.remove("playing");
        }

        // 現在の音声を再生
        currentAudioIndex = index;
        const audio = audioElements[currentAudioIndex];
        const voElement = voElements[currentAudioIndex];

        audio.playbackRate = playbackSpeed; // 再生速度を設定
        audio.play();
        voElement.classList.add("playing"); // ハイライトを追加

        // 再生中の要素が画面外の場合、スクロールする
        scrollToElement(voElement);

        // 再生終了時に次の音声を再生
        audio.onended = () => playAudio(currentAudioIndex + 1);
    }

    // 再生中の要素が画面外ならスクロール
    function scrollToElement(element) {
        const elementRect = element.getBoundingClientRect();

        // 上部または下部に隠れている場合のみスクロールを実行
        if (elementRect.left < SCROLL_PADDING ) {
            const book = document.querySelector(".book");
            book.scrollBy({
                left: -100,
                behavior: "smooth", // スムーズなスクロール
            });
        }
    }

    // 再生速度を調整
    function adjustPlaybackSpeed(touchX, touchY, touchTime) {
        if (!lastTouchPosition || !lastTouchTime) {
            lastTouchPosition = { x: touchX, y: touchY };
            lastTouchTime = touchTime;
            return;
        }

    // 垂直方向の移動距離を計算（下方向のみ考慮）
    const dy = touchY - lastTouchPosition.y; // Y座標の変化量
         if (dy > 0) {
        const timeDelta = touchTime - lastTouchTime; // ミリ秒単位の時間差

        // スワイプ速度に基づいて再生速度を設定
        if (timeDelta > 0) {
            const rawSpeed = (dy / timeDelta) * SPEED_SCALING_FACTOR;
            const smoothedSpeed = (rawSpeed + playbackSpeed) / 2; // スムージング
            playbackSpeed = Math.min(MAX_PLAYBACK_SPEED, Math.max(MIN_PLAYBACK_SPEED, smoothedSpeed));
        }
    }

        // 現在再生中の音声に反映
        if (currentAudioIndex !== -1) {
            audioElements[currentAudioIndex].playbackRate = playbackSpeed;
        }

        // 現在のタッチ位置と時間を更新
        lastTouchPosition = { x: touchX, y: touchY };
        lastTouchTime = touchTime;
    }

    // タッチ開始
    function startInteraction(event) {
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const startIndex = voElements.findIndex((el) => el === target);

        if (startIndex !== -1) {
            swipeStartIndex = startIndex; // スワイプ開始インデックス
            playAudio(swipeStartIndex); // 最初の音声を再生
            isSwiping = true;
        }

        lastTouchPosition = { x: touch.clientX, y: touch.clientY };
        lastTouchTime = performance.now();
    }

    // タッチ移動
    function moveInteraction(event) {
        if (!isSwiping || swipeStartIndex === -1) return;

        const touch = event.touches[0];
        const currentTime = performance.now();

        adjustPlaybackSpeed(touch.clientX, touch.clientY, currentTime);

        // 音声再生は順番に続ける（スワイプ中に別のvo要素に移動しても無視）
        if (currentAudioIndex === -1) {
            playAudio(swipeStartIndex);
        }
    }

    // タッチ終了
    function endInteraction() {
        if (currentAudioIndex !== -1) {
            audioElements[currentAudioIndex].pause();
            audioElements[currentAudioIndex].currentTime = 0;
        }

        // ハイライトを解除
        voElements.forEach((el) => el.classList.remove("playing"));

        // 状態をリセット
        isSwiping = false;
        currentAudioIndex = -1;
        swipeStartIndex = -1;
        lastTouchPosition = null;
        lastTouchTime = null;
    }

    // タッチイベントリスナーを登録
    document.addEventListener("touchstart", startInteraction, { passive: false });
    document.addEventListener("touchmove", moveInteraction, { passive: false });
    document.addEventListener("touchend", endInteraction);
});
