/**
 * Modern Gita - Final Logic
 */

let gitaData = [];

// ==========================================
// 1. DATA CONSTANTS
// ==========================================

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

// ==========================================
// 2. APP INITIALIZATION
// ==========================================

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('gita.json');
        if (!response.ok) throw new Error("File not found");
        const rawData = await response.json();

        // SMART DATA CLEANING
        gitaData = rawData.map(item => {
            let cleanSanskrit = (item.text || item.shloka || item.sanskrit || "")
                .replace(/\n/g, " ")       
                .replace(/[0-9.|]+$/g, '') 
                .trim();
            
            if(cleanSanskrit && !cleanSanskrit.endsWith("।") && !cleanSanskrit.endsWith("॥")) {
                cleanSanskrit += " ।।";
            }

            let rawEnglish = item.translation || 
                             item.meaning || 
                             item.english_meaning || 
                             item.transliteration || 
                             item.word_meanings || 
                             "Meaning unavailable.";
                             
            let cleanEnglish = rawEnglish.replace(/\n/g, " ").trim();

            return {
                chapter: item.chapter || item.chapter_number || item.chapter_id,
                verse: item.verse || item.verse_number || item.verse_id,
                sanskrit: cleanSanskrit,
                translation: cleanEnglish
            };
        });

        gitaData.sort((a, b) => {
            if (a.chapter === b.chapter) return a.verse - b.verse;
            return a.chapter - b.chapter;
        });

        initApp();

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('loading').innerHTML = `<span style="color:red">Error loading gita.json.</span>`;
    }
});

function initApp() {
    showRandomVerse();
    renderChapterList();
}

// ==========================================
// 3. NAVIGATION & ANIMATION
// ==========================================

const views = {
    home: document.getElementById('view-home'),
    chapters: document.getElementById('view-chapters'),
    reader: document.getElementById('view-reader')
};

document.getElementById('btn-home').addEventListener('click', () => switchView('home'));
document.getElementById('btn-chapters').addEventListener('click', () => switchView('chapters'));
document.getElementById('btn-back').addEventListener('click', () => switchView('chapters'));

function switchView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
    
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    if (viewName === 'home') document.getElementById('btn-home').classList.add('active');
    else document.getElementById('btn-chapters').classList.add('active');

    window.scrollTo(0, 0);
    fadeContent();
}

function fadeContent() {
    const main = document.querySelector('main:not(.hidden)');
    main.style.opacity = '0';
    main.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
    }, 50);
}

// ==========================================
// 4. CORE FEATURES
// ==========================================

function showRandomVerse() {
    if (gitaData.length === 0) return;
    const randomIndex = Math.floor(Math.random() * gitaData.length);
    const verse = gitaData[randomIndex];

    document.getElementById('loading').classList.add('hidden');
    document.getElementById('verse-content').classList.remove('hidden');
    
    document.getElementById('sanskrit-text').textContent = verse.sanskrit;
    document.getElementById('translation-text').textContent = verse.translation;
    document.getElementById('verse-reference').textContent = `Chapter ${verse.chapter} • Verse ${verse.verse}`;
}

function renderChapterList() {
    const grid = document.getElementById('chapter-grid');
    grid.innerHTML = ''; 

    for (let i = 1; i <= 18; i++) {
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.innerHTML = `
            <div style="font-size: 0.75rem; color: #B45309; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">Chapter ${i}</div>
            <h3 style="margin-bottom: 0.5rem;">${chapterTitlesSanskrit[i - 1]}</h3>
            <p style="font-family:'Playfair Display'; font-size:1rem; font-style:italic; color:#666;">${chapterTitlesEnglish[i - 1]}</p>
        `;
        card.onclick = () => openChapter(i);
        grid.appendChild(card);
    }
}

function openChapter(chapterNum) {
    const chapterVerses = gitaData.filter(v => v.chapter == chapterNum);
    const container = document.getElementById('reader-content');
    
    container.innerHTML = `
        <div style="text-align:center; margin-bottom: 4rem; border-bottom: 1px solid #eee; padding-bottom: 2rem;">
            <span style="color: #B45309; font-weight: bold; text-transform: uppercase; font-size: 0.8rem;">Chapter ${chapterNum}</span>
            <h2 style="font-family: 'Playfair Display', serif; font-size: 2.5rem; margin-bottom: 0.5rem;">${chapterTitlesSanskrit[chapterNum - 1]}</h2>
            <p style="color: #666; font-family: 'Playfair Display'; font-style:italic;">${chapterTitlesEnglish[chapterNum - 1]}</p>
        </div>
    `;

    chapterVerses.forEach(v => {
        const div = document.createElement('div');
        div.className = 'verse-block';
        div.innerHTML = `
            <span style="display:inline-block; background: #F3F4F6; color: #374151; font-weight: 600; font-size: 0.75rem; padding: 4px 12px; border-radius: 99px; margin-bottom: 1.5rem;">Verse ${v.verse}</span>
            <p style="font-family: 'Playfair Display', serif; font-size: 1.6rem; line-height: 1.8; margin-bottom: 1.5rem; color: #111;">${v.sanskrit}</p>
            <p style="font-family: 'Playfair Display', serif; font-size: 1.15rem; color: #555; line-height: 1.8;">${v.translation}</p>
        `;
        container.appendChild(div);
    });

    switchView('reader');
}