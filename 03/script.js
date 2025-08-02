class DialogueHighlighter {
    constructor() {
        this.audio = null;
        this.dialogueData = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.fullText = '';
        this.autoScrollEnabled = true;
        this.lastScrolledElement = null;
        this.scrollTimeout = null;
        this.isUserScrolling = false;
        this.currentDialogueLine = null;
        
        this.initializeElements();
        this.loadData();
    }

    initializeElements() {
        this.playBtn = document.getElementById('playBtn');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.timeSlider = document.getElementById('timeSlider');
        this.progressFill = document.getElementById('progressFill');
        this.dialogueContainer = document.getElementById('dialogueContainer');
        this.autoScrollToggle = document.getElementById('autoScrollToggle');

        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.timeSlider.addEventListener('input', (e) => this.seekTo(e.target.value));
        this.autoScrollToggle.addEventListener('change', (e) => {
            this.autoScrollEnabled = e.target.checked;
        });

        // Detect user manual scrolling
        this.dialogueContainer.addEventListener('scroll', () => {
            this.isUserScrolling = true;
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.isUserScrolling = false;
            }, 1500); // Reset after 1.5 seconds of no scrolling
        });

        // Detect touch/wheel scrolling
        this.dialogueContainer.addEventListener('wheel', () => {
            this.isUserScrolling = true;
        });

        this.dialogueContainer.addEventListener('touchstart', () => {
            this.isUserScrolling = true;
        });
    }

    async loadData() {
        try {
            // Load JSON data
            const response = await fetch('./jamesflora.json');
            this.dialogueData = await response.json();
            
            // Create full text from sentences
            this.fullText = this.dialogueData.sentence.map(s => s.s).join('\n');
            
            // Load audio
            this.audio = new Audio('./jamesflora.wav');
            
            this.audio.addEventListener('loadedmetadata', () => {
                this.duration = this.audio.duration;
                this.timeSlider.max = this.duration;
                this.updateTimeDisplay();
                this.renderDialogue();
            });

            this.audio.addEventListener('timeupdate', () => {
                this.currentTime = this.audio.currentTime;
                this.updateUI();
                this.highlightCurrentWords();
            });

            this.audio.addEventListener('ended', () => {
                this.isPlaying = false;
                this.playBtn.textContent = '▶️';
            });

        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Could not load audio or transcript data. Please check the files.');
        }
    }

    showError(message) {
        this.dialogueContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc3545;">
                <p>${message}</p>
            </div>
        `;
    }

    renderDialogue() {
        if (!this.dialogueData || !this.dialogueData.sentence) return;

        this.dialogueContainer.innerHTML = '';
        
        this.dialogueData.sentence.forEach((sentence, index) => {
            const dialogueLine = document.createElement('div');
            dialogueLine.className = `dialogue-line ${sentence.r.toLowerCase()}`;
            dialogueLine.setAttribute('data-start-time', sentence.t0);
            dialogueLine.setAttribute('data-end-time', sentence.t1);
            dialogueLine.setAttribute('data-sentence-index', index);
            
            const speaker = document.createElement('div');
            speaker.className = 'speaker';
            speaker.textContent = sentence.r;
            
            const dialogueText = document.createElement('div');
            dialogueText.className = 'dialogue-text';
            
            // Process sentence text with word highlighting
            const processedText = this.processTextWithWords(sentence.s, sentence.b, sentence.e);
            dialogueText.innerHTML = processedText;
            
            dialogueLine.appendChild(speaker);
            dialogueLine.appendChild(dialogueText);
            this.dialogueContainer.appendChild(dialogueLine);
        });
    }

    processTextWithWords(sentenceText, startChar, endChar) {
        // Get words that belong to this sentence
        const wordsInSentence = this.dialogueData.word.filter(wordData => {
            const charStart = wordData[3];
            return charStart >= startChar && charStart < endChar;
        });

        let result = '';
        let lastIndex = 0;

        // Sort words by character position
        wordsInSentence.sort((a, b) => a[3] - b[3]);

        wordsInSentence.forEach(wordData => {
            const [startTime, duration, word, charStart, charLength] = wordData;
            const relativeStart = charStart - startChar;
            const relativeEnd = relativeStart + charLength;

            // Add text before this word
            if (relativeStart > lastIndex) {
                result += sentenceText.slice(lastIndex, relativeStart);
            }

            // Add the word with highlighting span and click handler
            const wordText = sentenceText.slice(relativeStart, relativeEnd);
            result += `<span class="word" data-start="${startTime}" data-duration="${duration}" data-end="${startTime + duration}" onclick="window.highlighter.seekToWord(${startTime / 1000})">${wordText}</span>`;
            
            lastIndex = relativeEnd;
        });

        // Add remaining text
        if (lastIndex < sentenceText.length) {
            result += sentenceText.slice(lastIndex);
        }

        return result;
    }

    togglePlay() {
        if (!this.audio) return;

        if (this.isPlaying) {
            this.audio.pause();
            this.playBtn.textContent = '▶️';
        } else {
            this.audio.play();
            this.playBtn.textContent = '⏸️';
        }
        this.isPlaying = !this.isPlaying;
    }

    seekTo(time) {
        if (!this.audio) return;
        
        const seekTime = parseFloat(time);
        this.audio.currentTime = seekTime;
        this.currentTime = seekTime;
        this.updateUI();
        this.highlightCurrentWords();
    }

    seekToWord(timeInSeconds) {
        this.seekTo(timeInSeconds);
        // Force scroll to the clicked word and reset user scrolling state
        this.isUserScrolling = false;
        clearTimeout(this.scrollTimeout);
        
        // Temporarily ensure auto scroll works for clicked word
        setTimeout(() => {
            const currentTimeMs = timeInSeconds * 1000;
            const targetWord = document.querySelector(`.word[data-start="${currentTimeMs}"]`);
            if (targetWord && this.autoScrollEnabled) {
                this.scrollToElementSmooth(targetWord);
            }
        }, 100);
    }

    updateUI() {
        this.updateTimeDisplay();
        this.updateSlider();
        this.updateProgressBar();
    }

    updateTimeDisplay() {
        const current = this.formatTime(this.currentTime);
        const total = this.formatTime(this.duration);
        this.timeDisplay.textContent = `${current} / ${total}`;
    }

    updateSlider() {
        // Only update slider if user is not currently dragging it
        if (!this.isDragging) {
            this.timeSlider.value = this.currentTime;
        }
    }

    updateProgressBar() {
        const progress = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
        this.progressFill.style.width = `${progress}%`;
    }

    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    highlightCurrentWords() {
        if (!this.dialogueData || !this.dialogueData.word) return;

        const currentTimeMs = this.currentTime * 1000;
        let currentHighlightedWord = null;
        let currentDialogue = null;
        
        // Remove all existing highlights
        document.querySelectorAll('.word.highlight').forEach(word => {
            word.classList.remove('highlight');
        });

        // Remove active dialogue line class
        document.querySelectorAll('.dialogue-line.active').forEach(line => {
            line.classList.remove('active');
        });

        // Find current dialogue line
        document.querySelectorAll('.dialogue-line').forEach(dialogueLine => {
            const startTime = parseFloat(dialogueLine.getAttribute('data-start-time'));
            const endTime = parseFloat(dialogueLine.getAttribute('data-end-time'));
            
            if (currentTimeMs >= startTime && currentTimeMs <= endTime) {
                dialogueLine.classList.add('active');
                currentDialogue = dialogueLine;
            }
        });

        // Find and highlight current words
        document.querySelectorAll('.word').forEach(wordElement => {
            const startTime = parseFloat(wordElement.dataset.start);
            const endTime = parseFloat(wordElement.dataset.end);
            
            if (currentTimeMs >= startTime && currentTimeMs <= endTime) {
                wordElement.classList.add('highlight');
                currentHighlightedWord = wordElement;
            }
        });

        // Smart auto scroll to current dialogue line
        if (currentDialogue && this.shouldAutoScroll()) {
            this.scrollToDialogueLine(currentDialogue);
        }
    }

    scrollToDialogueLine(dialogueLine) {
        if (!dialogueLine || dialogueLine === this.currentDialogueLine) return;

        // Don't scroll for the first dialogue line
        const sentenceIndex = parseInt(dialogueLine.getAttribute('data-sentence-index'));
        if (sentenceIndex === 0) {
            this.currentDialogueLine = dialogueLine;
            this.highlightCurrentDialogue(dialogueLine);
            return;
        }

        const container = this.dialogueContainer;
        
        // Check if dialogue line is visible in container
        if (this.isDialogueVisible(dialogueLine)) {
            // Just highlight without scrolling if already visible
            this.currentDialogueLine = dialogueLine;
            this.highlightCurrentDialogue(dialogueLine);
        } else {
            // Scroll to center the dialogue line
            this.scrollToDialogueCenter(dialogueLine);
            this.currentDialogueLine = dialogueLine;
            this.highlightCurrentDialogue(dialogueLine);
        }
    }

    isDialogueVisible(dialogueLine) {
        const container = this.dialogueContainer;
        const containerRect = container.getBoundingClientRect();
        const dialogueRect = dialogueLine.getBoundingClientRect();
        
        // Check if dialogue is fully visible with some margin
        const margin = 40;
        return (
            dialogueRect.top >= (containerRect.top + margin) &&
            dialogueRect.bottom <= (containerRect.bottom - margin)
        );
    }

    scrollToDialogueCenter(dialogueLine) {
        if (!dialogueLine) return;

        const container = this.dialogueContainer;
        const containerHeight = container.clientHeight;
        const dialogueTop = this.getElementOffsetTop(dialogueLine, container);
        const dialogueHeight = dialogueLine.offsetHeight;
        
        // Center the dialogue in the container
        const targetScrollTop = dialogueTop - (containerHeight / 2) + (dialogueHeight / 2);
        const maxScroll = container.scrollHeight - containerHeight;
        const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll));
        
        // Use custom smooth animation
        this.animateScrollToDialogue(container, container.scrollTop, finalScrollTop, 400);
    }

    animateScrollToDialogue(element, start, end, duration) {
        const startTime = performance.now();
        const distance = end - start;
        
        const animateStep = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing for dialogue transitions
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            const currentPosition = start + distance * easeOutQuart;
            element.scrollTop = currentPosition;
            
            if (progress < 1 && !this.isUserScrolling) {
                requestAnimationFrame(animateStep);
            }
        };
        
        requestAnimationFrame(animateStep);
    }

    highlightCurrentDialogue(dialogueLine) {
        // Remove previous current dialogue highlight
        document.querySelectorAll('.dialogue-line.current').forEach(line => {
            line.classList.remove('current');
        });
        
        // Add current dialogue highlight with delay for smooth transition
        if (dialogueLine) {
            setTimeout(() => {
                dialogueLine.classList.add('current');
            }, 100);
        }
    }

    shouldAutoScroll() {
        return this.isPlaying && 
               this.autoScrollEnabled && 
               !this.isUserScrolling && 
               !this.isDragging;
    }

    scrollToElementSmooth(element) {
        if (!element) return;

        const container = this.dialogueContainer;
        const containerHeight = container.clientHeight;
        const elementTop = this.getElementOffsetTop(element, container);
        const elementHeight = element.offsetHeight;
        
        // Calculate target scroll position (center the element with slight offset towards top)
        const targetScrollTop = elementTop - (containerHeight * 0.4) + (elementHeight / 2);
        const maxScroll = container.scrollHeight - containerHeight;
        const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll));
        
        // Use requestAnimationFrame for smoother animation
        this.animateScroll(container, container.scrollTop, finalScrollTop, 300);
    }

    getElementOffsetTop(element, container) {
        let offsetTop = 0;
        let currentElement = element;
        
        while (currentElement && currentElement !== container) {
            offsetTop += currentElement.offsetTop;
            currentElement = currentElement.offsetParent;
        }
        
        return offsetTop;
    }

    animateScroll(element, start, end, duration) {
        const startTime = performance.now();
        const distance = end - start;
        
        const animateStep = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeInOutCubic = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            const currentPosition = start + distance * easeInOutCubic;
            element.scrollTop = currentPosition;
            
            if (progress < 1 && !this.isUserScrolling) {
                requestAnimationFrame(animateStep);
            }
        };
        
        requestAnimationFrame(animateStep);
    }
}

// Track slider dragging state
let isDragging = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.highlighter = new DialogueHighlighter();
    
    // Add slider drag detection
    const timeSlider = document.getElementById('timeSlider');
    timeSlider.addEventListener('mousedown', () => {
        window.highlighter.isDragging = true;
    });
    
    document.addEventListener('mouseup', () => {
        window.highlighter.isDragging = false;
    });
    
    timeSlider.addEventListener('touchstart', () => {
        window.highlighter.isDragging = true;
    });
    
    document.addEventListener('touchend', () => {
        window.highlighter.isDragging = false;
    });
});