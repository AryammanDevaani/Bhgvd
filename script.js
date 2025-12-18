let gitaData = [];
let currentVerseObj = null;

// Control flags for the animation loop
let warInterval = null;
let stopWarRequested = false; 

// =========================================
// 1. DATA & CONSTANTS
// =========================================
const MY_WEBSITE_URL = "bhgvd.com";
const APP_TITLE = "Śrīmad Bhagavad Gītā";

const chapterTitlesEnglish = [
    "The Distress of Arjuna", "The Path of Knowledge", "The Path of Selfless Action",
    "Wisdom in Action", "The Path of Renunciation", "The Path of Meditation",
    "Knowledge and Realization", "The Imperishable Eternal", "The Royal Secret",
    "The Divine Splendor", "The Vision of the Cosmic Form", "The Path of Devotion",
    "Nature, the Enjoyer, and Consciousness", "The Three Modes of Material Nature",
    "The Supreme Divine Personality", "The Divine and Demoniac Natures",
    "The Three Divisions of Faith", "Liberation and Renunciation"
];

const chapterTitlesSanskrit = [
    "अर्जुनविषादयोग", "सांख्ययोग", "कर्मयोग", "ज्ञानकर्मसंन्यासयोग",
    "कर्मसंन्यासयोग", "ध्यानयोग", "ज्ञानविज्ञानयोग", "अक्षरब्रह्मयोग",
    "राजविद्याराजगुह्ययोग", "विभूतियोग", "विश्वरूपदर्शनयोग", "भक्तियोग",
    "क्षेत्रक्षेत्रज्ञविभागयोग", "गुणत्रयविभागयोग", "पुरुषोत्तमयोग",
    "दैवासुरसंपद्विभागयोग", "श्रद्धात्रयविभागयोग", "मोक्षसंन्यासयोग"
];

// =========================================
// 2. INITIALIZATION
// =========================================
window.addEventListener('DOMContentLoaded', async () => {
    
    // 1. START THE WAR LOOP IMMEDIATELY
    startWarLoop();

    // 2. Attempt Fetch
    try {
        const response = await fetch('gita.json');
        if (!response.ok) throw new Error("File not found");
        const rawData = await response.json();

        gitaData = rawData.map(item => {
            let cleanSanskrit = (item.text || item.shloka || item.sanskrit || "")
                .replace(/[0-9.|]+$/g, '').trim();

            if (cleanSanskrit && !cleanSanskrit.endsWith("।") && !cleanSanskrit.endsWith("॥")) {
                cleanSanskrit += " ।।";
            }
            let rawEnglish = item.translation || item.meaning || "Meaning unavailable.";
            
            return {
                chapter: item.chapter || item.chapter_number || 1,
                verse: item.verse || item.verse_number || 1,
                sanskrit: cleanSanskrit,
                translation: rawEnglish.trim()
            };
        });

        gitaData.sort((a, b) => {
            if (a.chapter === b.chapter) return a.verse - b.verse;
            return a.chapter - b.chapter;
        });

        renderChapterList();

        // SUCCESS: Request the war to stop!
        stopWarRequested = true;

    } catch (error) {
        console.error("Fetch failed, War continues:", error);
    }
});

// =========================================
// 3. WAR LOOP LOGIC
// =========================================

function startWarLoop() {
    const loader = document.getElementById('war-loader');
    const content = document.getElementById('verse-content');
    const loadingText = document.getElementById('loading');

    // Reset UI
    if(loadingText) loadingText.classList.add('hidden');
    if(content) content.classList.add('hidden');
    if(loader) {
        loader.classList.remove('hidden');
        loader.innerHTML = '';
        loader.style.opacity = '1';
    }

    // Function to fire one round of arrows
    const fireVolley = () => {
        if (stopWarRequested) {
            clearInterval(warInterval);
            revealSuccess();
            return;
        }

        if(loader) {
            // 100 Enemy Arrows
            for (let i = 0; i < 100; i++) {
                fireProjectile(loader, 'left');
            }
            // 5 Hero Arrows
            for (let i = 0; i < 5; i++) {
                fireProjectile(loader, 'right');
            }
        }
    };

    // Fire first round immediately
    fireVolley();

    // Schedule subsequent rounds
    warInterval = setInterval(fireVolley, 2200);
}

function revealSuccess() {
    const loader = document.getElementById('war-loader');
    const content = document.getElementById('verse-content');

    // 1. Fade out War
    if(loader) {
        loader.style.transition = 'opacity 0.5s ease';
        loader.style.opacity = '0';
        setTimeout(() => { loader.classList.add('hidden'); }, 500);
    }

    // 2. Pick and Show Verse
    if (gitaData.length > 0) {
        const randomIndex = Math.floor(Math.random() * gitaData.length);
        const verse = gitaData[randomIndex];
        currentVerseObj = verse;

        document.getElementById('sanskrit-text').textContent = verse.sanskrit;
        document.getElementById('translation-text').textContent = verse.translation;
        document.getElementById('verse-reference').textContent = `Chapter ${verse.chapter} • Verse ${verse.verse}`;
        
        if(content) {
            content.classList.remove('hidden');
            content.animate([
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], { duration: 800, easing: 'ease-out', fill: 'forwards' });
        }
    }
}

// =========================================
// 4. PHYSICS ENGINE (SVG & Off-Screen Logic)
// =========================================
function fireProjectile(container, side) {
    if(!container) return;
    
    const arrow = document.createElement('div');
    arrow.classList.add('war-arrow');
    arrow.classList.add(side === 'left' ? 'arrow-left' : 'arrow-right');
    if (side === 'right') arrow.classList.add('arrow-hero');

    // INSERT REALISTIC SVG ARROW (Pointing Right ->)
    arrow.innerHTML = `
        <svg viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10H78" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M75 3L98 10L75 17L78 10L75 3Z" fill="currentColor"/>
            <path d="M5 2L25 10L5 10V2Z" fill="currentColor"/>
            <path d="M5 18L25 10L5 1V18Z" fill="currentColor"/>
        </svg>
    `;

    // 1. Coordinates: Start/End FAR off-screen (-150px)
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Left Army: Starts far left, lands far right
    // Right Army: Starts far right, lands far left
    let startX = side === 'left' ? -150 : w + 150;
    
    // Randomize Start Height (Bottom half of screen)
    let startY = h - (Math.random() * (h * 0.5)); 

    // End Position: Just past the middle, ensuring they cross screen
    let endX = side === 'left' ? w + 150 : -150;
    let endY = (h * 0.2) + (Math.random() * (h * 0.5)); 

    // 2. Physics (Bezier Control Point)
    let peakHeight = h * 0.1;
    let controlX = (startX + endX) / 2;
    let controlY = -peakHeight + (Math.random() * 100);

    const pathString = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`;
    arrow.style.offsetPath = `path('${pathString}')`;
    
    // 3. Visual Variation
    const scale = 0.8 + (Math.random() * 0.4); 
    arrow.style.transform = `scale(${scale})`;
    arrow.style.zIndex = Math.floor(scale * 100);

    container.appendChild(arrow);

    // 4. Animation (Linear, Constant Visibility)
    const duration = 1500 + (Math.random() * 500); // 1.5s to 2.0s
    
    const animation = arrow.animate([
        { offsetDistance: '0%' },
        { offsetDistance: '100%' } 
    ], {
        duration: duration,
        easing: 'linear', // Constant speed
        fill: 'forwards'
    });

    animation.finished.then(() => {
        arrow.remove();
    });
}

// =========================================
// 5. NAVIGATION LOGIC
// =========================================
const views = {
    home: document.getElementById('view-home'),
    chapters: document.getElementById('view-chapters'),
    reader: document.getElementById('view-reader'),
    install: document.getElementById('view-install')
};

const btnHome = document.getElementById('btn-home');
const btnChapters = document.getElementById('btn-chapters');
const btnInstallView = document.getElementById('btn-install-view');

if (btnHome) {
    btnHome.onclick = () => {
        const isHomeActive = !views.home.classList.contains('hidden');
        if (isHomeActive) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            switchView('home');
        }
    };
}

if (btnChapters) {
    btnChapters.onclick = () => {
        const isReading = !views.reader.classList.contains('hidden');
        const isChaptersActive = !views.chapters.classList.contains('hidden');

        if (isReading || isChaptersActive) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            switchView('chapters');
        }
    };
}

if (btnInstallView) {
    btnInstallView.onclick = () => {
        const isInstallActive = !views.install.classList.contains('hidden');
        if(isInstallActive) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            switchView('install');
        }
    };
}

function switchView(viewName) {
    // Hide all views
    Object.values(views).forEach(el => {
        if(el) el.classList.add('hidden');
    });
    
    // Show selected view
    if(views[viewName]) views[viewName].classList.remove('hidden');

    // Reset Nav Buttons
    [btnHome, btnChapters, btnInstallView].forEach(btn => {
        if(btn) btn.classList.remove('active');
    });

    // Set Active State & Button Text
    if (viewName === 'home') {
        btnHome.classList.add('active');
    } 
    else if (viewName === 'chapters' || viewName === 'reader') {
        btnChapters.classList.add('active');
        btnChapters.textContent = "Chapters"; 
    }
    else if (viewName === 'install') {
        btnInstallView.classList.add('active');
        updateInstallView(); 
    }

    // TRIGGER FADE IN FOR EVERY VIEW CHANGE
    fadeContent();

    window.scrollTo(0, 0);
}

function fadeContent() {
    const main = document.querySelector('main:not(.hidden)');
    if(!main) return;
    
    // Reset to transparent
    main.style.opacity = '0';
    main.style.transform = 'translateY(10px)';
    
    // Trigger reflow (optional safety) before applying transition
    void main.offsetWidth; 

    // Apply Transition
    main.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    setTimeout(() => {
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
    }, 50);
}

// =========================================
// 6. CORE FEATURES (Verse Manual Refresh)
// =========================================
function showRandomVerse() {
    // Manual Refresh Logic:
    stopWarRequested = false;
    startWarLoop(); // Start War
    
    setTimeout(() => {
        if(gitaData.length > 0) {
            stopWarRequested = true; // Stop War
        }
    }, 2000); 
}

function renderChapterList() {
    const grid = document.getElementById('chapter-grid');
    if(!grid) return;
    grid.innerHTML = '';

    for (let i = 1; i <= 18; i++) {
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.innerHTML = `
            <div style="font-size: 0.8rem; color: #B45309; font-family: var(--font-english); font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">Chapter ${i}</div>
            <h3 style="margin-bottom: 0.5rem;">${chapterTitlesSanskrit[i - 1]}</h3>
            <p>${chapterTitlesEnglish[i - 1]}</p>
        `;
        card.onclick = () => openChapter(i);
        grid.appendChild(card);
    }
}

function openChapter(chapterNum) {
    const chapterVerses = gitaData.filter(v => v.chapter == chapterNum);
    const container = document.getElementById('reader-content');

    container.innerHTML = `
        <div style="max-width: 750px; margin: 0 auto; text-align: left;">
            <button onclick="switchView('chapters')" class="back-link" aria-label="Back to Chapters">
                ←
            </button>
        </div>

        <div style="text-align:center; margin-bottom: 4rem; padding-bottom: 2rem;">
            <span style="color: #B45309; font-family: var(--font-english); font-weight: 700; text-transform: uppercase; font-size: 0.9rem;">Chapter ${chapterNum}</span>
            <h2 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${chapterTitlesSanskrit[chapterNum - 1]}</h2>
            <p style="color: #666; font-family: var(--font-english); font-style:italic;">${chapterTitlesEnglish[chapterNum - 1]}</p>
        </div>
    `;

    chapterVerses.forEach(v => {
        const div = document.createElement('div');
        div.className = 'verse-block';
        div.innerHTML = `
            <span class="verse-pill" style="margin-bottom: 1.5rem;">Verse ${v.verse}</span>
            <p>${v.sanskrit}</p>
            <p>${v.translation}</p>
        `;
        container.appendChild(div);
    });

    switchView('reader');
}

// =========================================
// 7. SHARE & INSTALL LOGIC
// =========================================
const btnShare = document.getElementById('btn-share');
const cardToCapture = document.getElementById('shareable-card-wrapper');

if(btnShare) {
    btnShare.addEventListener('click', async () => {
        const originalIcon = btnShare.innerHTML;
        btnShare.classList.add('loading');
        const verseRefSpan = document.getElementById('verse-reference');
        const originalRefText = verseRefSpan.textContent;

        try {
            const canvas = await html2canvas(cardToCapture, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#F9F7F2",
                windowWidth: 800,
                onclone: (clonedDoc) => {
                    const footer = clonedDoc.querySelector('.card-footer');
                    const ref = clonedDoc.getElementById('verse-reference');
                    const wrapper = clonedDoc.getElementById('shareable-card-wrapper');

                    if (footer) {
                        footer.style.display = 'block';
                        footer.textContent = MY_WEBSITE_URL;
                    }
                    if (ref) {
                        ref.textContent = `${APP_TITLE} \u00A0|\u00A0 ${originalRefText}`;
                    }
                    if (wrapper) {
                        wrapper.style.width = "550px";
                        wrapper.style.margin = "0 auto";
                        wrapper.style.border = "2px solid #B45309"; 
                        wrapper.style.borderRadius = "20px";
                    }
                }
            });

            const dataURL = canvas.toDataURL('image/png');
            const blob = await (await fetch(dataURL)).blob();
            const file = new File([blob], 'verse.png', { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: APP_TITLE });
            } else {
                const a = document.createElement('a');
                a.download = 'verse.png';
                a.href = dataURL;
                a.click();
            }
        } catch (err) {
            console.error("Share failed", err);
        } finally {
            btnShare.classList.remove('loading');
            btnShare.innerHTML = originalIcon;
        }
    });
}

// Detect Device Type
const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
const iosInstructions = document.getElementById('instructions-ios');
const androidInstructions = document.getElementById('instructions-android');
const successMsg = document.getElementById('install-success');

function updateInstallView() {
    if(iosInstructions) iosInstructions.classList.add('hidden');
    if(androidInstructions) androidInstructions.classList.add('hidden');
    if(successMsg) successMsg.classList.add('hidden');

    if (isStandalone) {
        if(successMsg) successMsg.classList.remove('hidden');
    } 
    else if (isIos) {
        if(iosInstructions) iosInstructions.classList.remove('hidden');
    } 
    else {
        if(androidInstructions) androidInstructions.classList.remove('hidden');
    }
}

// Desktop Hide Logic
const navInstallBtn = document.getElementById('btn-install-view');
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// UPDATED LOGIC: Only show if Mobile AND NOT already installed
if (isMobileDevice && !isStandalone && navInstallBtn) {
    navInstallBtn.style.display = 'block';
} else if (navInstallBtn) {
    // Force hide if installed (or desktop)
    navInstallBtn.style.display = 'none';
}