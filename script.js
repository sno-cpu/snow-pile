const canvas = document.getElementById("mandalaCanvas");
const ctx = canvas.getContext("2d");
const colorButtons = document.querySelectorAll(".colorBtn");
const symmetrySlider = document.getElementById("symmetrySlider");
const undoBtn = document.getElementById("undoBtn");
const clearBtn = document.getElementById("clearBtn");
const releaseBtn = document.getElementById("releaseBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

let drawing = false;
let symmetry = 4;
let currentColor = "red";
let paths = [];
let lastPoint = null; // Track the last point for interpolation

// Update symmetry slices
symmetrySlider.addEventListener("input", (e) => {
    symmetry = parseInt(e.target.value);
});

// Change color selection
colorButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        currentColor = btn.dataset.color;
    });
});

// Start drawing
canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    paths.push({ points: [], symmetry }); // Store symmetry with each stroke
});

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

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
    drawing = false;
    lastPoint = null; // Reset last point
});

// Undo last stroke
undoBtn.addEventListener("click", () => {
    paths.pop();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCanvas();
});

// Clear canvas
clearBtn.addEventListener("click", () => {
    paths = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCanvas();
});

// Let Go - starts river animation
releaseBtn.addEventListener("click", () => {
    fadeOutMandalas();
});

// Interpolate points for smoother lines
function interpolatePoints(x1, y1, x2, y2, color) {
    const steps = 10; // Number of interpolation steps
    const dx = (x2 - x1) / steps;
    const dy = (y2 - y1) / steps;

    for (let i = 1; i < steps; i++) {
        const ix = x1 + dx * i;
        const iy = y1 + dy * i;
        drawSymmetricPoints(ix, iy, color, symmetry);
        paths[paths.length - 1].points.push({ x: ix, y: iy, color });
    }
}

// Function to draw symmetry
function drawSymmetricPoints(x, y, color, symmetryValue) {
    ctx.fillStyle = color;
    for (let i = 0; i < symmetryValue; i++) {
        const angle = (i * 2 * Math.PI) / symmetryValue;
        const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
        const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
        ctx.beginPath();
        ctx.arc(rotatedX + canvas.width / 2, rotatedY + canvas.height / 2, 3, 0, Math.PI * 2); // Reduced radius to 2
        ctx.fill();
    }
}

// Redraw the canvas after undo or clear
function redrawCanvas() {
    drawCircularBorder(); // Ensure the circular border is redrawn
    paths.forEach((stroke) => {
        stroke.points.forEach((point) => {
            drawSymmetricPoints(point.x, point.y, point.color, stroke.symmetry);
        });
    });
}

// Draw a circular border
function drawCircularBorder() {
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Fade out the mandala, show the river, and display a random quote
function fadeOutMandalas() {
    let opacity = 1;
    const fadeInterval = setInterval(() => {
        console.log("Fading out mandalas, current opacity:", opacity); 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.globalAlpha = 1; 
        ctx.fillStyle = "#0077b6";
        ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

        // Draw the fading mandala and circular border
        if (opacity > 0) {
            ctx.globalAlpha = opacity; 
            redrawCanvas();
        }

        opacity -= 0.1; // Gradually reduce opacity
        if (opacity <= 0) {
            clearInterval(fadeInterval);
            ctx.globalAlpha = 1; // Reset alpha to ensure no lingering transparency
            displayQuoteAndButton(); // Show quote and button after fade-out
        }
    }, 50);
}

// Display a random quote and "Draw Again" button
function displayQuoteAndButton() {
    const quotes = [
        "The journey is the reward.",
        "Creativity takes courage.",
        "Art is freedom.",
        "Every artist was first an amateur.",
        "The soul never thinks without an image."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Create quote element
    const quoteElement = document.createElement("div");
    quoteElement.id = "quote";
    quoteElement.textContent = randomQuote;
    quoteElement.style.position = "absolute";
    quoteElement.style.top = "40%";
    quoteElement.style.left = "50%";
    quoteElement.style.transform = "translate(-50%, -50%)";
    quoteElement.style.fontSize = "24px";
    quoteElement.style.color = "white";
    quoteElement.style.textAlign = "center";
    document.body.appendChild(quoteElement);

    // Create "Draw Again" button
    const button = document.createElement("button");
    button.id = "drawAgainBtn";
    button.textContent = "Draw Again";
    button.style.position = "absolute";
    button.style.top = "50%";
    button.style.left = "50%";
    button.style.transform = "translate(-50%, -50%)";
    button.style.padding = "10px 20px";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";
    button.style.borderRadius = "5px";
    button.style.backgroundColor = "#0077b6";
    button.style.color = "white";
    button.addEventListener("click", resetCanvas);
    document.body.appendChild(button);
}

// Reset the canvas and UI for a new drawing
function resetCanvas() {
    // Remove quote and button
    const quoteElement = document.getElementById("quote");
    const button = document.getElementById("drawAgainBtn");
    if (quoteElement) quoteElement.remove();
    if (button) button.remove();

    // Clear the canvas and reset transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1; // Reset alpha to fully opaque

    // Redraw the circular border
    drawCircularBorder();
    paths = []; // Reset paths
}

// Ensure the circular border is drawn initially
drawCircularBorder();
