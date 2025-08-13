let timingData = null;
let audio = null;
let isPlaying = false;
let currentTime = 0;
let duration = 0;
let animationFrame = null;
let startTime = null;
let pausedAt = 0;
let autoScrollEnabled = true;

const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const playText = document.getElementById('playText');
const timeDisplay = document.getElementById('timeDisplay');
const progressSlider = document.getElementById('progressSlider');
const transcript = document.getElementById('transcript');
const transcriptContainer = document.querySelector('.transcript-container');

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimeDisplay() {
    const current = formatTime(currentTime);
    const total = formatTime(duration);
    timeDisplay.textContent = `${current} / ${total}`;
}

function updateProgress() {
    progressSlider.value = audio ? audio.currentTime : currentTime;
    updateTimeDisplay();
}

function highlightCurrentWord() {
    if (!timingData || !audio) return;
    const nowTime = audio.currentTime;
    document.querySelectorAll('.word').forEach(word => {
        word.classList.remove('highlighted', 'past');
    });
    let currentWordIndex = -1;
    for (let i = 0; i < timingData.word.length; i++) {
        const word = timingData.word[i];
        const start = word[0] / 1000;
        const end = (word[0] + word[1]) / 1000;
        if (nowTime >= start && nowTime < end) {
            currentWordIndex = i;
            break;
        }
    }
    document.querySelectorAll('.word').forEach((wordElement, index) => {
        if (index === currentWordIndex) {
            wordElement.classList.add('highlighted');
            if (autoScrollEnabled) {
                const elementTop = wordElement.offsetTop;
                const elementHeight = wordElement.offsetHeight;
                const containerHeight = transcriptContainer.clientHeight;
                const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
                transcriptContainer.scrollTo({ top: scrollTop, behavior: 'smooth' });
            }
        } else {
            const wordData = timingData.word[index];
            const end = (wordData[0] + wordData[1]) / 1000;
            if (nowTime > end) {
                wordElement.classList.add('past');
            }
        }
    });
}
const autoScrollBtn = document.getElementById('autoScrollBtn');
autoScrollBtn.addEventListener('click', () => {
    autoScrollEnabled = !autoScrollEnabled;
    autoScrollBtn.textContent = 'Auto Scroll: ' + (autoScrollEnabled ? 'Bật' : 'Tắt');
    autoScrollBtn.style.background = autoScrollEnabled ? '#e8f5e8' : '#f8d7da';
    autoScrollBtn.style.color = autoScrollEnabled ? '#2e7d32' : '#a94442';
});

function renderTranscript() {
    if (!timingData) return;
    let html = '';
    let currentSpeaker = '';
    let sentenceIndex = 0;
    timingData.sentence.forEach((sentence, sIdx) => {
        html += `<span class="speaker">${sentence.r}:</span> `;
        // Lấy các từ thuộc câu này
        const wordsInSentence = timingData.word.filter(word => word[3] >= sentence.b && word[3] < sentence.e);
        wordsInSentence.forEach((word, wIdx) => {
            html += `<span class="word" data-index="${sentenceIndex}" data-time="${word[0]/1000}">${word[2]}</span> `;
            sentenceIndex++;
        });
        html += '<br><br>';
    });
    transcript.innerHTML = html;
}

function seekTo(time) {
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(time, duration));
    updateProgress();
    highlightCurrentWord();
}


function play() {
    isPlaying = true;
    updatePlayButton();
    if (audio) audio.play();
}

function pause() {
    isPlaying = false;
    updatePlayButton();
    if (audio) audio.pause();
}

function updatePlayButton() {
    if (isPlaying) {
        playText.textContent = 'Tạm dừng';
    } else {
        playText.textContent = 'Phát';
    }
}

function resetToStart() {
    currentTime = 0;
    pausedAt = 0;
    updateProgress();
    highlightCurrentWord();
    if (audio) audio.currentTime = 0;
}

// Event listeners
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        pause();
    } else {
        play();
    }
});
progressSlider.addEventListener('input', (e) => {
    if (!audio) return;
    audio.currentTime = parseFloat(e.target.value);
    updateProgress();
    highlightCurrentWord();
});
transcript.addEventListener('click', (e) => {
    if (e.target.classList.contains('word')) {
        const time = parseFloat(e.target.dataset.time);
        seekTo(time);
    }
});

// Load dữ liệu JSON và audio
fetch('jamesflora.json')
    .then(res => res.json())
    .then(data => {
        timingData = data;
        renderTranscript();
        audio = new Audio('jamesflora.wav');
        audio.preload = 'auto';
        audio.addEventListener('loadedmetadata', () => {
            duration = audio.duration;
            progressSlider.max = duration;
            updateTimeDisplay();
        });
        audio.addEventListener('ended', () => {
            pause();
            resetToStart();
        });
        audio.addEventListener('timeupdate', () => {
            updateProgress();
            highlightCurrentWord();
        });
    });
