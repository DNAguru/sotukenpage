document.addEventListener("DOMContentLoaded", () => {
    const voElements = document.querySelectorAll(".vo");
    const audioBasePath = "voice/"; // 音声ファイルのパス
    let currentAudio = null;
    let currentIndex = -1;
    let playbackRate = 1; // 初期再生速度

    // 再生速度変更用のセレクトボックスを作成
    const speedSelector = document.createElement("select");
    const speeds = [0.5, 0.8, 1, 1.2, 1.5, 2, 3, 5];
    speeds.forEach(speed => {
        const option = document.createElement("option");
        option.value = speed;
        option.textContent = `${speed}x`;
        if (speed === playbackRate) option.selected = true;
        speedSelector.appendChild(option);
    });
    document.body.appendChild(speedSelector);
    speedSelector.style.position = "fixed";
    speedSelector.style.top = "10px";
    speedSelector.style.right = "10px";
    speedSelector.addEventListener("change", (e) => {
        playbackRate = parseFloat(e.target.value);
        if (currentAudio) {
            currentAudio.playbackRate = playbackRate;
        }
    });

    // 再生停止ボタンを作成
    const stopButton = document.createElement("button");
    stopButton.textContent = "再生停止";
    stopButton.style.position = "fixed";
    stopButton.style.top = "50px";
    stopButton.style.right = "10px";
    document.body.appendChild(stopButton);

    stopButton.addEventListener("click", () => {
        stopCurrentPlayback();
    });

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
});
