document.addEventListener("DOMContentLoaded", () => {
    const voElements = document.querySelectorAll(".vo");
    const audioBasePath = "voice/"; // 音声ファイルのパス
    let currentAudio = null;
    let currentIndex = -1;
    let playbackRate = 1; // 初期再生速度

    // コンテナを作成
    const controlContainer = document.createElement("div");
    controlContainer.id = "control-container";
    document.body.appendChild(controlContainer);

    // 再生速度変更用のセレクトボックスを作成
    const speedSelector = document.createElement("select");
    speedSelector.id = "speed-selector";
    const speeds = [0.5, 0.8, 1, 1.2, 1.5, 2, 3, 5];
    speeds.forEach(speed => {
        const option = document.createElement("option");
        option.value = speed;
        option.textContent = `${speed}x`;
        if (speed === playbackRate) option.selected = true;
        speedSelector.appendChild(option);
    });

    // 再生速度変更時の動作
    speedSelector.addEventListener("change", (e) => {
        playbackRate = parseFloat(e.target.value);
        if (currentAudio) {
            currentAudio.playbackRate = playbackRate;
        }
    });

   controlContainer.appendChild(speedSelector);

    // 再生停止ボタンを作成
    const stopButton = document.createElement("button");
    stopButton.id = "stop-button";
    stopButton.textContent = "再生停止";

    stopButton.addEventListener("click", () => {
        stopCurrentPlayback();
    });

    controlContainer.appendChild(stopButton);

    // 再生停止機能
    function stopCurrentPlayback() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        voElements.forEach(el => el.classList.remove("playing")); // ハイライト解除
        currentAudio = null;
        currentIndex = -1;
    }

    function playAudioFromIndex(index) {
        stopCurrentPlayback(); // 現在の再生を停止

        if (index < 0 || index >= voElements.length) return; // 範囲外なら終了

        currentIndex = index;
        const element = voElements[currentIndex];
        const audioId = element.id.replace("vo", "").padStart(3, "0");
        const audio = new Audio(`${audioBasePath}${audioId}.wav`);
        currentAudio = audio;
        currentAudio.playbackRate = playbackRate;

        // ハイライト
        voElements.forEach(el => el.classList.remove("playing"));
        element.classList.add("playing");

        // 再生中の要素が画面外の場合にスクロール
        scrollToElement(element);

        // 次の音声を再生
        currentAudio.addEventListener("ended", () => {
            playAudioFromIndex(currentIndex + 1);
        });

        // 再生
        currentAudio.play();
    }

    // 各要素にクリックイベントを設定
    voElements.forEach((element, index) => {
        element.addEventListener("click", () => {
            playAudioFromIndex(index);
        });
    });

    // 再生中の要素が画面外の場合にスクロール
    function scrollToElement(element) {
        const elementRect = element.getBoundingClientRect();
        const SCROLL_PADDING = 10; // スクロール時の余白

        if (elementRect.left < SCROLL_PADDING ) {
            const book = document.querySelector(".book");
            book.scrollBy({
                left: -100,
                behavior: "smooth", // スムーズなスクロール
            });
        }
    }
});
