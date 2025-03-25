// Russian alphabet letters
const letters = [
    'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М',
    'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ',
    'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'
];

const categories = [
    { id: 'aesthetics', name: 'Aesthetics', leftEmoji: '✨', rightEmoji: '✨' },
    { id: 'sound', name: 'Sound', leftEmoji: '🔊', rightEmoji: '🔊' },
    { id: 'writing', name: 'Writing Flow', leftEmoji: '✍️', rightEmoji: '✍️' },
    { id: 'uniqueness', name: 'Uniqueness', leftEmoji: '🎯', rightEmoji: '🎯' },
    { id: 'cultural', name: 'Cultural Impact', leftEmoji: '🎭', rightEmoji: '🎭' }
];

// Store ratings in localStorage
let ratings = {};
let currentIndex = 0;
let isTransitioning = false;

// DOM Elements
const card = document.getElementById('currentCard');
const letterElement = card.querySelector('.letter');
const progressBar = document.getElementById('progress');
const resetButton = document.getElementById('resetButton');
const resultsScreen = document.getElementById('resultsScreen');
const rateAgainButton = document.getElementById('rateAgainButton');
const randomFillButton = document.getElementById('randomFillButton');

// Create proceed button
const proceedButton = document.createElement('button');
proceedButton.className = 'proceed-button visible';
proceedButton.textContent = 'Proceed →';
proceedButton.addEventListener('click', nextCard);

// Create card footer
const cardFooter = document.createElement('div');
cardFooter.className = 'card-footer';
cardFooter.appendChild(proceedButton);
card.appendChild(cardFooter);

// Create finish review button
const finishReviewButton = document.createElement('button');
finishReviewButton.className = 'finish-review-button';
finishReviewButton.textContent = 'Finish Review';
finishReviewButton.addEventListener('click', finishReview);

// Add finish review button to the button group in stats
const buttonGroup = document.querySelector('.button-group');
buttonGroup.appendChild(finishReviewButton);

// Calculate average rating for a letter
function calculateLetterRating(letterRatings) {
    if (!letterRatings) return 0;
    const ratings = Object.values(letterRatings);
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

// Check if letter is fully rated
function isLetterFullyRated(letterRatings) {
    return letterRatings && Object.keys(letterRatings).length === categories.length;
}

// Reset all ratings
function resetRatings() {
    ratings = {};
    localStorage.removeItem('letterRatings');
    currentIndex = 0;
    isTransitioning = false;
    updateCard();
    updateStats();
    hideResults();
}

// Create rating sliders for a category
function createRatingButtons(category, container) {
    const slider = container.querySelector('.slider');
    const valueDisplay = container.querySelector('.rating-value');
    const letterRatings = ratings[letters[currentIndex]] || {};
    
    // Set initial value if exists
    if (letterRatings[category]) {
        slider.value = letterRatings[category];
        valueDisplay.textContent = letterRatings[category];
    }
    
    slider.addEventListener('input', () => {
        if (isTransitioning) return;
        
        valueDisplay.textContent = slider.value;
        
        // Save rating
        const currentLetter = letters[currentIndex];
        if (!ratings[currentLetter]) {
            ratings[currentLetter] = {};
        }
        ratings[currentLetter][category] = parseInt(slider.value);
        localStorage.setItem('letterRatings', JSON.stringify(ratings));
    });
}

// Update card content
function updateCard() {
    if (currentIndex >= letters.length) {
        showResults();
        return;
    }
    
    card.style.display = 'flex';
    letterElement.textContent = letters[currentIndex];
    
    // Update sliders for each category
    categories.forEach(category => {
        const ratingContainer = card.querySelector(`[data-category="${category.id}"]`);
        const slider = ratingContainer.querySelector('.slider');
        const valueDisplay = ratingContainer.querySelector('.rating-value');
        
        // Reset slider and value display
        const letterRatings = ratings[letters[currentIndex]] || {};
        slider.value = letterRatings[category.id] || 5;
        valueDisplay.textContent = slider.value;
        
        // Recreate event listeners
        createRatingButtons(category.id, ratingContainer);
    });
    
    // Update progress bar
    const progress = (currentIndex / letters.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Show results screen
function showResults() {
    // Hide the card container and show results
    card.style.display = 'none';
    resultsScreen.classList.remove('hidden');
    
    // Trigger confetti
    const end = Date.now() + 5000; // 5 seconds of animation
    
    // Initial burst
    confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.6 },
        zIndex: 2000
    });

    // Cannon effect from corners
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    let skew = 1;

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    (function frame() {
        const timeLeft = animationEnd - Date.now();
        const ticks = Math.max(200, 500 * (timeLeft / duration));

        skew = Math.max(0.8, skew - 0.001);

        confetti({
            particleCount: 1,
            startVelocity: 0,
            ticks: ticks,
            origin: {
                x: Math.random(),
                y: (Math.random() * skew) - 0.2
            },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
            shapes: ['circle', 'square'],
            gravity: randomInRange(0.4, 0.6),
            scalar: randomInRange(0.8, 1.2),
            drift: randomInRange(-0.4, 0.4),
            zIndex: 2000
        });

        if (timeLeft > 0) {
            requestAnimationFrame(frame);
        }
    }());

    // Fire multiple bursts
    const burstInterval = setInterval(() => {
        if (Date.now() > end) {
            clearInterval(burstInterval);
            return;
        }

        confetti({
            particleCount: 80,
            angle: randomInRange(60, 120),
            spread: randomInRange(50, 70),
            origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
            startVelocity: randomInRange(30, 60),
            gravity: 1.2,
            shapes: ['circle', 'square'],
            scalar: randomInRange(0.8, 1.2),
            zIndex: 2000
        });
    }, 300);

    // Create results grid - only for rated letters
    const resultsGrid = document.querySelector('.results-grid');
    resultsGrid.innerHTML = '';
    
    const ratedLetters = letters.filter(letter => 
        ratings[letter] && Object.keys(ratings[letter]).length > 0
    );
    
    ratedLetters.forEach((letter, index) => {
        const letterRatings = ratings[letter];
        const averageRating = calculateLetterRating(letterRatings);
        
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        resultCard.style.animationDelay = `${index * 0.05}s`;
        
        let categoryHtml = '<div class="categories-mini">';
        categories.forEach(category => {
            const rating = letterRatings[category.id] || 0;
            categoryHtml += `
                <div class="category-tag" title="${category.name}: ${rating}/10">
                    ${category.leftEmoji} ${rating}
                </div>
            `;
        });
        categoryHtml += '</div>';
        
        resultCard.innerHTML = `
            <div class="letter">${letter}</div>
            <div class="rating-value">${averageRating.toFixed(1)}/10</div>
            ${categoryHtml}
        `;
        resultsGrid.appendChild(resultCard);
    });
    
    // Show overall top and bottom 3 - only from rated letters
    const sortedLetters = ratedLetters.sort((a, b) => 
        calculateLetterRating(ratings[b]) - calculateLetterRating(ratings[a])
    );
    
    const topList = document.getElementById('topList');
    const bottomList = document.getElementById('bottomList');
    topList.innerHTML = '';
    bottomList.innerHTML = '';
    
    // Top 3
    sortedLetters.slice(0, 3).forEach((letter, index) => {
        const averageRating = calculateLetterRating(ratings[letter]);
        const item = document.createElement('div');
        item.className = 'rank-item';
        item.innerHTML = `
            <div class="rank">#${index + 1}</div>
            <div class="letter">${letter}</div>
            <div class="rating-value">${averageRating.toFixed(1)}/10</div>
        `;
        topList.appendChild(item);
    });
    
    // Bottom 3
    sortedLetters.slice(-3).reverse().forEach((letter, index) => {
        const averageRating = calculateLetterRating(ratings[letter]);
        const item = document.createElement('div');
        item.className = 'rank-item';
        item.innerHTML = `
            <div class="rank">#${sortedLetters.length - 2 + index}</div>
            <div class="letter">${letter}</div>
            <div class="rating-value">${averageRating.toFixed(1)}/10</div>
        `;
        bottomList.appendChild(item);
    });

    // Show category-based rankings - only for rated letters
    const categoryRankings = document.createElement('div');
    categoryRankings.className = 'category-rankings';

    categories.forEach((category, categoryIndex) => {
        // Sort letters by this category's rating - only rated ones
        const sortedByCategory = ratedLetters
            .filter(letter => ratings[letter][category.id])
            .sort((a, b) => ratings[b][category.id] - ratings[a][category.id]);

        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.style.animationDelay = `${categoryIndex * 0.1}s`;

        let categoryContent = `
            <h3>
                <span class="emoji">${category.leftEmoji}</span>
                <span class="category-name">${category.name}</span>
                <span class="emoji">${category.rightEmoji}</span>
            </h3>
        `;

        // Show top letters for this category (up to 3, but no more than available)
        const topCount = Math.min(3, sortedByCategory.length);
        if (topCount > 0) {
            sortedByCategory.slice(0, topCount).forEach((letter, index) => {
                const rating = ratings[letter][category.id];
                categoryContent += `
                    <div class="rank-item" style="animation-delay: ${index * 0.1}s">
                        <div class="rank">#${index + 1}</div>
                        <div class="letter">${letter}</div>
                        <div class="rating-value">${rating}/10</div>
                    </div>
                `;
            });
        } else {
            categoryContent += `
                <div class="no-ratings">
                    No ratings yet
                </div>
            `;
        }

        categorySection.innerHTML = categoryContent;
        categoryRankings.appendChild(categorySection);
    });

    // Only add category rankings if we have any rated letters
    if (ratedLetters.length > 0) {
        // Add category rankings after the overall rankings
        const existingRankings = resultsScreen.querySelector('.top-letters');
        existingRankings.insertAdjacentElement('afterend', categoryRankings);
    }
}

// Update statistics
function updateStats() {
    // Count letters that have at least one rating
    let totalRating = 0;
    let ratedCount = 0;

    // Go through each letter
    letters.forEach(letter => {
        const letterRatings = ratings[letter];
        if (letterRatings) {
            const categoryRatings = Object.values(letterRatings);
            // Only count if there are actual ratings
            if (categoryRatings.length > 0) {
                ratedCount++;
                // Calculate average for this letter
                totalRating += categoryRatings.reduce((a, b) => a + b, 0) / categoryRatings.length;
            }
        }
    });

    // Calculate overall average
    const averageRating = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : '0.0';
    
    // Update the display
    document.getElementById('averageRating').textContent = averageRating;
    document.getElementById('totalRated').textContent = ratedCount;
}

// Random fill function
function randomFill() {
    // Keep track of current letter if in the middle of rating
    const currentLetter = currentIndex < letters.length ? letters[currentIndex] : null;
    const currentRatings = currentLetter ? ratings[currentLetter] : null;

    // Fill all unrated categories for all letters
    letters.forEach(letter => {
        if (!ratings[letter]) {
            ratings[letter] = {};
        }
        
        categories.forEach(category => {
            if (!ratings[letter][category.id]) {
                ratings[letter][category.id] = Math.floor(Math.random() * 10) + 1;
            }
        });
    });

    // Save to localStorage
    localStorage.setItem('letterRatings', JSON.stringify(ratings));

    // If we were in the middle of rating, keep the current letter's original ratings
    if (currentLetter && currentRatings) {
        ratings[currentLetter] = { ...ratings[currentLetter], ...currentRatings };
    }

    // Show results since all letters are now rated
    updateStats();
    showResults();
}

function createSmokeEffect() {
    const smokeContainer = document.createElement('div');
    smokeContainer.className = 'smoke-container';
    
    // Create more smoke particles with 3D positioning
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'smoke-particle';
        
        // Wider horizontal spread and random Z depth
        const xSpread = Math.random() * 200 - 100;
        const zDepth = Math.random() * 100 - 50;
        
        particle.style.setProperty('--x', `${xSpread}px`);
        particle.style.setProperty('--z', `${zDepth}px`);
        
        // Varied delays for more natural effect
        particle.style.animationDelay = `${Math.random() * 0.4}s`;
        
        // Random initial position
        particle.style.left = `${50 + (Math.random() * 40 - 20)}%`;
        particle.style.bottom = `${Math.random() * 20}px`;
        
        smokeContainer.appendChild(particle);
    }
    
    return smokeContainer;
}

function addScreenShake() {
    const card = document.querySelector('.card');
    card.classList.add('shake');
    
    // Add a stronger initial impact
    card.style.transform = 'translate3d(0, 20px, -30px) rotate3d(1, 0, 0, 15deg)';
    
    // Reset the transform after a short delay
    setTimeout(() => {
        card.style.transform = '';
    }, 50);
    
    setTimeout(() => {
        card.classList.remove('shake');
    }, 600);
}

function nextCard() {
    if (isTransitioning) return;
    
    isTransitioning = true;
    
    // Save current ratings even if sliders weren't moved
    const currentLetter = letters[currentIndex];
    if (!ratings[currentLetter]) {
        ratings[currentLetter] = {};
    }
    
    // Save all category ratings
    categories.forEach(category => {
        const ratingContainer = card.querySelector(`[data-category="${category.id}"]`);
        const slider = ratingContainer.querySelector('.slider');
        if (!ratings[currentLetter][category.id]) {
            ratings[currentLetter][category.id] = parseInt(slider.value);
        }
    });
    
    // Save to localStorage
    localStorage.setItem('letterRatings', JSON.stringify(ratings));
    
    letterElement.classList.add('exit');
    
    const categoryElements = card.querySelectorAll('.category');
    categoryElements.forEach(category => {
        category.style.opacity = '0';
        category.style.transform = 'translateX(50px)';
    });
    
    setTimeout(() => {
        currentIndex++;
        
        if (currentIndex >= letters.length) {
            updateStats();
            showResults();
            isTransitioning = false;
            return;
        }
        
        letterElement.textContent = letters[currentIndex];
        letterElement.classList.remove('exit');
        letterElement.classList.add('enter');
        
        categories.forEach((category, index) => {
            const ratingContainer = card.querySelector(`[data-category="${category.id}"]`);
            const slider = ratingContainer.querySelector('.slider');
            const valueDisplay = ratingContainer.querySelector('.rating-value');
            
            const letterRatings = ratings[letters[currentIndex]] || {};
            slider.value = letterRatings[category.id] || 5;
            valueDisplay.textContent = slider.value;
            
            const categoryElement = ratingContainer.parentElement;
            categoryElement.style.opacity = '';
            categoryElement.style.transform = '';
            
            createRatingButtons(category.id, ratingContainer);
        });
        
        const progress = (currentIndex / letters.length) * 100;
        progressBar.style.width = `${progress}%`;
        
        updateStats();
        
        const oldSmoke = document.querySelector('.smoke-container');
        if (oldSmoke) oldSmoke.remove();
        
        setTimeout(() => {
            addScreenShake();
            const letterSection = document.querySelector('.letter-section');
            const smokeEffect = createSmokeEffect();
            letterSection.appendChild(smokeEffect);
            
            setTimeout(() => {
                smokeEffect.remove();
            }, 1200);
        }, 600);
        
        setTimeout(() => {
            letterElement.classList.remove('enter');
            isTransitioning = false;
        }, 800);
    }, 500);
}

// Hide results screen
function hideResults() {
    resultsScreen.classList.add('hidden');
    card.style.display = 'flex';
}

// Function to finish review early
function finishReview() {
    if (isTransitioning) return;
    
    // Save current letter's ratings if any sliders were moved
    const currentLetter = letters[currentIndex];
    if (ratings[currentLetter] && Object.keys(ratings[currentLetter]).length > 0) {
        // Save all category ratings for current letter
        categories.forEach(category => {
            const ratingContainer = card.querySelector(`[data-category="${category.id}"]`);
            const slider = ratingContainer.querySelector('.slider');
            ratings[currentLetter][category.id] = parseInt(slider.value);
        });
        localStorage.setItem('letterRatings', JSON.stringify(ratings));
    }
    
    updateStats();
    showResults();
}

// Add event listeners
resetButton.addEventListener('click', resetRatings);
rateAgainButton.addEventListener('click', resetRatings);
randomFillButton.addEventListener('click', randomFill);

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Load existing ratings if any
    const savedRatings = localStorage.getItem('letterRatings');
    if (savedRatings) {
        ratings = JSON.parse(savedRatings);
    }
    resetRatings();
}); 