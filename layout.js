document.addEventListener('DOMContentLoaded', () => {
    const spanElements = document.querySelectorAll('.vo');
    const maxCharsPerLine = 50; // 1行に収めたい文字数

    spanElements.forEach(span => {
        const text = span.textContent;
        const lines = [];
        let currentLine = '';

        for (let char of text) {
            currentLine += char;
            if (currentLine.length >= maxCharsPerLine) {
                lines.push(currentLine);
                currentLine = '';
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }

        // 改行ごとに `<br>` を挿入して新しい内容を設定
        span.innerHTML = lines.join('<br>');
    });
});
