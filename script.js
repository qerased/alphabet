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
    
    // Make sure results screen has the proper structure
    if (!resultsScreen.querySelector('.results-content')) {
        const resultsContent = document.createElement('div');
        resultsContent.className = 'results-content';
        
        // Move any existing elements into the content container
        while (resultsScreen.firstChild) {
            resultsContent.appendChild(resultsScreen.firstChild);
        }
        
        resultsScreen.appendChild(resultsContent);
    }

    const resultsContent = resultsScreen.querySelector('.results-content');
    
    // Reset scroll position to top when reopening
    resultsContent.scrollTop = 0;

    // Update the results content
    resultsContent.innerHTML = `
        <h2>Final Ratings</h2>
        <div class="results-grid"></div>
        <div class="top-letters">
            <div class="top-section">
                <h3>Top 3 Letters</h3>
                <div id="topList"></div>
            </div>
            <div class="bottom-section">
                <h3>Bottom 3 Letters</h3>
                <div id="bottomList"></div>
            </div>
        </div>
        <div id="categoryRankingsContainer"></div>
        <button id="rateAgainButton" class="primary-button">Rate Again</button>
    `;
    
    // Re-add event listener for rate again button
    document.getElementById('rateAgainButton').addEventListener('click', resetRatings);

    // Get all rated letters with at least one rating
    const ratedLetters = letters.filter(letter => 
        ratings[letter] && Object.keys(ratings[letter]).length > 0
    );
    
    if (ratedLetters.length === 0) {
        const resultsGrid = resultsContent.querySelector('.results-grid');
        resultsGrid.innerHTML = '<div class="no-ratings">No letters have been rated yet</div>';
        return;
    }

    // Calculate and display each letter's results
    const resultsGrid = resultsContent.querySelector('.results-grid');
    resultsGrid.innerHTML = '';

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
                <div class="category-tag">
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

    // Calculate letter averages and sort by rating
    const lettersWithAverages = ratedLetters.map(letter => {
        return {
            letter,
            average: calculateLetterRating(ratings[letter])
        };
    });
    
    const sortedLetters = [...lettersWithAverages].sort((a, b) => b.average - a.average);

    // Get elements to populate
    const topList = resultsContent.querySelector('#topList');
    const bottomList = resultsContent.querySelector('#bottomList');
    topList.innerHTML = '';
    bottomList.innerHTML = '';

    // Add top 3 (or fewer if not enough rated)
    const topCount = Math.min(3, sortedLetters.length);
    for (let i = 0; i < topCount; i++) {
        const item = document.createElement('div');
        item.className = 'rank-item';
        item.style.opacity = '1'; // Ensure visibility
        item.innerHTML = `
            <div class="rank">#${i + 1}</div>
            <div class="letter">${sortedLetters[i].letter}</div>
            <div class="rating-value">${sortedLetters[i].average.toFixed(1)}/10</div>
        `;
        topList.appendChild(item);
    }

    // Add bottom 3 (or fewer if not enough rated)
    const bottomCount = Math.min(3, sortedLetters.length);
    for (let i = 0; i < bottomCount; i++) {
        const idx = sortedLetters.length - 1 - i;
        if (idx >= 0) {
            const item = document.createElement('div');
            item.className = 'rank-item';
            item.style.opacity = '1'; // Ensure visibility
            item.innerHTML = `
                <div class="rank">#${sortedLetters.length - i}</div>
                <div class="letter">${sortedLetters[idx].letter}</div>
                <div class="rating-value">${sortedLetters[idx].average.toFixed(1)}/10</div>
            `;
            bottomList.appendChild(item);
        }
    }

    // Create category rankings
    const categoryRankingsContainer = document.getElementById('categoryRankingsContainer');
    categoryRankingsContainer.className = 'category-rankings';
    categoryRankingsContainer.innerHTML = '';

    // Create category-specific rankings
    categories.forEach((category, categoryIndex) => {
        // Sort letters by this category's rating
        const categoryRankings = ratedLetters
            .map(letter => ({
                letter,
                rating: ratings[letter][category.id] || 0
            }))
            .filter(item => item.rating > 0)
            .sort((a, b) => b.rating - a.rating);
        
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        
        let categoryContent = `
            <h3>
                <span class="emoji">${category.leftEmoji}</span>
                <span class="category-name">${category.name}</span>
                <span class="emoji">${category.rightEmoji}</span>
            </h3>
        `;

        // Show top 3 for this category (or fewer if not enough)
        if (categoryRankings.length > 0) {
            const topCategoryCount = Math.min(3, categoryRankings.length);
            for (let i = 0; i < topCategoryCount; i++) {
                const rankItem = categoryRankings[i];
                categoryContent += `
                    <div class="rank-item" style="opacity: 1;">
                        <div class="rank">#${i + 1}</div>
                        <div class="letter">${rankItem.letter}</div>
                        <div class="rating-value">${rankItem.rating}/10</div>
                    </div>
                `;
            }
        } else {
            categoryContent += `
                <div class="no-ratings">
                    No ratings yet
                </div>
            `;
        }

        categorySection.innerHTML = categoryContent;
        categoryRankingsContainer.appendChild(categorySection);
    });

    // Trigger confetti with high z-index
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 2000
    });

    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            zIndex: 2000
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            zIndex: 2000
        });
    }, 500);
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

    // Update stats and show results
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

// Add event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Close modal with ESC key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !resultsScreen.classList.contains('hidden')) {
            resetRatings();
        }
    });

    // Close modal when clicking outside
    resultsScreen.addEventListener('click', function(event) {
        // If the click is directly on the resultsScreen (backdrop) and not on its children
        if (event.target === resultsScreen) {
            resetRatings();
        }
    });
}); 