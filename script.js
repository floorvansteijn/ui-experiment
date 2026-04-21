// --- DATABASE CONNECTION ---
// REPLACE this with the Web App URL you copied from the Google Apps Script deployment
const DATABASE_URL = "https://script.google.com/macros/s/AKfycbyd5XlJQa-6wBVjuyh1rT36_VXMPIwiH0HPZWBIwpUIKHdpu95-96VLZ4kvlvLplgdVIQ/exec";

// Experiment State Variables
let startTime, endTime, searchTime;
let assignedTheme = "";

// Experimental Materials: Common 5-letter words [cite: 57]
const targetWord = "APPLE";
const nonTargetWords = [
    "TABLE", "CHAIR", "PLANT", "GHOST", "TRAIN", "HOUSE", "MOUSE", "CLOCK", 
    "BREAD", "WATER", "STORM", "BRICK", "PAPER", "GLASS", "SHIRT", "SHOES"
];

// Generates a grid of 100 words with 1 target word hidden randomly [cite: 56]
function generateWordGrid() {
    const grid = document.getElementById('word-grid');
    let words = [];
    
    for(let i=0; i<99; i++) {
        const randomWord = nonTargetWords[Math.floor(Math.random() * nonTargetWords.length)];
        words.push(`<span class="word" onclick="handleWrongClick()">${randomWord}</span>`);
    }
    
    // Concealed target word for the search task
    const concealedTarget = `<span class="word" onclick="handleTargetClick()">${targetWord}</span>`;
    const insertIndex = Math.floor(Math.random() * 100);
    words.splice(insertIndex, 0, concealedTarget);
    
    grid.innerHTML = words.join('');
}

// Phase Transition: Start Task (Randomized A/B Assignment) [cite: 29, 46]
function startTask() {
    // Randomly assign Light Mode [cite: 19] or Dark Mode [cite: 20]
    assignedTheme = Math.random() < 0.5 ? "Light Mode" : "Dark Mode";
    const body = document.getElementById('main-body');
    
    if (assignedTheme === "Dark Mode") {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    }

    document.getElementById('instruction-page').classList.add('hidden');
    document.getElementById('task-page').classList.remove('hidden');
    generateWordGrid();

    // Start background timer automatically [cite: 41, 47]
    startTime = performance.now();
}

function handleWrongClick() {
    // Logic for incorrect clicks can be added here if needed
}

// Phase Transition: Target Found (Measure Search Time) [cite: 49]
function handleTargetClick() {
    endTime = performance.now();
    // Calculate continuous search time in seconds [cite: 24]
    searchTime = ((endTime - startTime) / 1000).toFixed(3);

    // Standardize survey environment [cite: 50]
    document.getElementById('main-body').classList.remove('dark-mode');
    document.getElementById('main-body').classList.add('light-mode');

    document.getElementById('task-page').classList.add('hidden');
    document.getElementById('survey-page').classList.remove('hidden');
}

// Phase Transition: Submit Survey & Send to Database [cite: 51, 62]
document.getElementById('readability-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const formData = new FormData(this);
    const rating = formData.get('readability'); // 5-point Likert scale [cite: 27, 64]

    // Data object for the database
    const experimentData = {
        theme: assignedTheme,
        searchTime: searchTime,
        rating: rating
    };

    // --- DATA COLLECTION SCRIPT (FETCH) ---
    // This sends the data to your Google Sheet database
    fetch(DATABASE_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experimentData)
    }).then(() => {
        // Show thank you page and local data summary [cite: 51]
        document.getElementById('survey-page').classList.add('hidden');
        document.getElementById('thank-you-page').classList.remove('hidden');

        document.getElementById('data-theme').innerText = assignedTheme;
        document.getElementById('data-time').innerText = searchTime;
        document.getElementById('data-rating').innerText = rating;
    }).catch(err => {
        console.error("Error saving to database:", err);
    });
});