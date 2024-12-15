// スクロールボタンの操作
document.addEventListener("DOMContentLoaded", () => {
    const prevPageButton = document.getElementById("prev-page-button");
    const nextPageButton = document.getElementById("next-page-button");

    const SCROLL_AMOUNT = 300;

prevPageButton.addEventListener('touchstart', () => {
    const book = document.querySelector(".book");
    book.scrollBy({
        left: SCROLL_AMOUNT,
        behavior: "smooth",
    });
});

nextPageButton.addEventListener('touchstart', () => {
    const book = document.querySelector(".book");
    book.scrollBy({
        left: -SCROLL_AMOUNT,
        behavior: "smooth",
    });
});

});