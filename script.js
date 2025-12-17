let gitaData = [];
let currentVerseObj = null;

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

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('gita.json');
        if (!response.ok) throw new Error("File not found");
        const rawData = await response.json();

        gitaData = rawData.map(item => {
            let cleanSanskrit = (item.text || item.shloka || item.sanskrit || "")
                .replace(/[0-9.|]+$/g, '')
                .trim();

            if (cleanSanskrit && !cleanSanskrit.endsWith("।") && !cleanSanskrit.endsWith("॥")) {
                cleanSanskrit += " ।।";
            }
            let rawEnglish = item.translation ||
                item.meaning ||
                item.english_meaning ||
                item.transliteration ||
                item.word_meanings ||
                "Meaning unavailable.";
            let cleanEnglish = rawEnglish.trim();

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

const views = {
    home: document.getElementById('view-home'),
    chapters: document.getElementById('view-chapters'),
    reader: document.getElementById('view-reader')
};

const btnHome = document.getElementById('btn-home');
const btnChapters = document.getElementById('btn-chapters');

btnHome.addEventListener('click', () => switchView('home'));
btnChapters.addEventListener('click', () => switchView('chapters'));

function switchView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    if (viewName === 'home') {
        btnHome.classList.add('active');
        btnChapters.textContent = "Read All";
    }
    else if (viewName === 'chapters') {
        btnChapters.classList.add('active');
        btnChapters.textContent = "Read All";
    }
    else if (viewName === 'reader') {
        btnChapters.classList.add('active');
        btnChapters.textContent = "Back";
    }

    window.scrollTo(0, 0);
    fadeContent();
}

function fadeContent() {
    const main = document.querySelector('main:not(.hidden)');
    main.style.opacity = '0';
    main.style.transform = 'translateY(10px)';
    main.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    setTimeout(() => {
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
    }, 50);
}

function showRandomVerse() {
    if (gitaData.length === 0) return;
    const randomIndex = Math.floor(Math.random() * gitaData.length);
    const verse = gitaData[randomIndex];

    currentVerseObj = verse;

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



const MY_WEBSITE_URL = "bhgvd.com";
const APP_TITLE = "Śrīmad Bhagavad Gītā";



function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

const btnShare = document.getElementById('btn-share');
const cardToCapture = document.getElementById('shareable-card-wrapper');

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
            windowWidth: 800, // Forces the browser to think it's a desktop width
            onclone: (clonedDoc) => {
                // We modify the "Ghost Clone" instead of your actual screen
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
                    wrapper.style.width = "550px"; // Forces a perfect card width in the image
                    wrapper.style.margin = "0 auto";
                    wrapper.style.border = "0px solid #B45309";
                }
            }
        });

        const dataURL = canvas.toDataURL('image/png');
        const blob = await (await fetch(dataURL)).blob();
        const file = new File([blob], 'verse.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: APP_TITLE });
        } else {
            const a = document.createElement('a'); a.download = 'verse.png'; a.href = dataURL; a.click();
        }
    } catch (err) {
        console.error("Share failed", err);
    } finally {
        btnShare.classList.remove('loading');
        btnShare.innerHTML = originalIcon;
    }
});