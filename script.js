const canvas = document.getElementById("mandalaCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

const colorButtons = document.querySelectorAll(".colorBtn");
const symmetrySlider = document.getElementById("symmetrySlider");
const undoBtn = document.getElementById("undoBtn");
const clearBtn = document.getElementById("clearBtn");
const releaseBtn = document.getElementById("releaseBtn");
const symmetryBubble = document.getElementById("symmetryBubble");



let drawing = false;
let symmetry = 6;
let currentColor = "red";
let paths = [];
let lastPoint = null;
let isReleased = false;
let bubbleFadeTimeout;


symmetrySlider.addEventListener("input", (e) => {
    symmetry = parseInt(e.target.value);
    updateSymmetryBubble(e.target);
});

function updateSymmetryBubble(slider) {
    const rect = slider.getBoundingClientRect();
    const thumbPosition = ((slider.value - slider.min) / (slider.max - slider.min)) * rect.width;
    symmetryBubble.style.left = `${thumbPosition}px`;
    symmetryBubble.textContent = slider.value;
    symmetryBubble.style.opacity = "1";

    clearTimeout(bubbleFadeTimeout);
    bubbleFadeTimeout = setTimeout(() => {
        symmetryBubble.style.opacity = "0";
    }, 1000);
}

colorButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        currentColor = btn.dataset.color;
    });
});

canvas.addEventListener("mousedown", (e) => {
    if (isReleased) return;
    drawing = true;
    paths.push({ points: [], symmetry });
});

canvas.addEventListener("mousemove", (e) => {
    if (isReleased || !drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;

    const distanceFromCenter = Math.sqrt(x * x + y * y);
    const radius = Math.min(canvas.width, canvas.height) / 2;

    if (distanceFromCenter <= radius) {
        if (lastPoint) {
            interpolatePoints(lastPoint.x, lastPoint.y, x, y, currentColor);
        }
        drawSymmetricPoints(x, y, currentColor, symmetry);
        paths[paths.length - 1].points.push({ x, y, color: currentColor });
        lastPoint = { x, y };
    }
});

canvas.addEventListener("mouseup", () => {
    if (isReleased) return;
    drawing = false;
    lastPoint = null;
});

undoBtn.addEventListener("click", () => {
    if (isReleased) return;
    paths.pop();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCanvas();
});

clearBtn.addEventListener("click", () => {
    if (isReleased) return;
    paths = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCanvas();
});

releaseBtn.addEventListener("click", () => {
    if (isReleased) return;
    isReleased = true;
    fadeOutMandalas();
});



function interpolatePoints(x1, y1, x2, y2, color) {
    const steps = 10;
    const dx = (x2 - x1) / steps;
    const dy = (y2 - y1) / steps;

    for (let i = 1; i < steps; i++) {
        const ix = x1 + dx * i;
        const iy = y1 + dy * i;
        drawSymmetricPoints(ix, iy, color, symmetry);
        paths[paths.length - 1].points.push({ x: ix, y: iy, color });
    }
}

function drawSymmetricPoints(x, y, color, symmetryValue) {
    ctx.fillStyle = color;
    for (let i = 0; i < symmetryValue; i++) {
        const angle = (i * 2 * Math.PI) / symmetryValue;
        const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
        const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
        ctx.beginPath();
        ctx.arc(rotatedX + canvas.width / 2, rotatedY + canvas.height / 2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function redrawCanvas() {
    drawCircularBorder();
    paths.forEach((stroke) => {
        stroke.points.forEach((point) => {
            drawSymmetricPoints(point.x, point.y, point.color, stroke.symmetry);
        });
    });
}

function drawCircularBorder() {
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
}



function fadeOutMandalas() {
    let opacity = 1;
    const fadeInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#0077b6";
        ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

        if (opacity > 0) {
            ctx.globalAlpha = opacity;
            redrawCanvas();
        }

        opacity -= 0.1;
        if (opacity <= 0) {
            clearInterval(fadeInterval);
            ctx.globalAlpha = 1;
            displayQuoteAndButton();
        }
    }, 50);
}

function displayQuoteAndButton() {
    const quotes = [
        "“You can only lose what you cling to.”<br>— Buddha",
        "“Letting go takes a lot of courage sometimes. But once you let go, happiness comes very quickly. You won't have to go around search for it.”<br>— Thich Nhat Hanh",
        "“Letting go gives us freedom, and freedom is the only condition for happiness. If, in our heart, we still cling to anything - anger, anxiety, or possessions - we cannot be free.”<br>― Thich Nhat Hanh",
        "“If you know how to let go and be at peace, you know everything you need to know about living in the world.”<br>– Ajahn Brahm",
        "“Life isn't heavy when you know how to let go.“<br>— Ajahn Brahm",
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const quoteElement = document.getElementById("quote");
    const button = document.getElementById("drawAgainBtn");

    quoteElement.innerHTML = randomQuote;

    quoteElement.style.display = "block";
    button.style.display = "block";

    button.addEventListener("click", resetCanvas);
}



function resetCanvas() {
    const quoteElement = document.getElementById("quote");
    const button = document.getElementById("drawAgainBtn");

    quoteElement.style.display = "none";
    button.style.display = "none";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    drawCircularBorder();
    paths = [];
    isReleased = false;
}



drawCircularBorder();
