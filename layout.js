document.addEventListener("DOMContentLoaded", () => {
    const bookElement = document.querySelector(".book");

    // タッチイベントで「引き下げて更新」を防止
    document.body.addEventListener("touchmove", (e) => {
        e.preventDefault(); // 全体のスクロール動作を無効化
    });

    // なぞる動作の処理
    bookElement.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);

    });
});
