document.addEventListener('DOMContentLoaded', () => {
    // Usunięto Dzień 2 z prostych niespodzianek
    const simpleSurprises = {
        3: { type: 'text', content: 'Dzień trzeci! Ciekaw jestem, czy zgadniesz, co będzie jutro...' },
        7: { type: 'text', content: 'To już koniec! Dziękuję za wspólną zabawę. Kocham Cię! ❤️' }
    };

    // --- NOWOŚĆ: Konfiguracja Quizu ---
    const quizData = {
        question: "Gdzie odbędzie się nasz wymarzony piknik?",
        options: {
            A: "Na dachu wieżowca",
            B: "Na leśnej polanie",
            C: "Na plaży o zachodzie słońca",
            D: "Wszystkie odpowiedzi są poprawne, bo z Tobą wszędzie jest cudownie!"
        },
        correctAnswer: 'D'
    };
    const afterCorrectAnswerQuiz = '<h2>Wygrałaś! ❤️</h2><p>W nagrodę zapraszam Cię na niezapomniany piknik! Przygotuj kocyk i dobry humor, resztą zajmę się ja. Co Ty na to?</p>';
    let quizAttempts = 0;
    // --- Koniec konfiguracji Quizu ---

    let currentPhotoIndex = 0;
    let photos = [];

    const dayCards = document.querySelectorAll('.day-card');
    const modal = document.getElementById('surprise-modal');
    const closeButton = document.querySelector('.close-button');
    const galleryContainer = document.getElementById('photo-gallery');
    const galleryImage = document.getElementById('gallery-image');
    const galleryDescription = document.getElementById('gallery-description');
    const otherSurpriseContainer = document.getElementById('other-surprise');
    const quizContainer = document.getElementById('quiz-container');

    function syncDescriptionWidth() {
        if (galleryImage && galleryDescription) {
            const imageWidth = galleryImage.offsetWidth;
            galleryDescription.style.width = `${imageWidth}px`;
        }
    }

    const observer = new ResizeObserver(() => {
        if (modal.style.display === 'flex' && galleryContainer.style.display !== 'none') {
            syncDescriptionWidth();
        }
    });
    observer.observe(galleryImage);

    dayCards.forEach(card => {
        card.addEventListener('click', () => {
            const day = card.getAttribute('data-day');
            const dayType = card.getAttribute('data-type');
            
            // Ukryj wszystkie kontenery w modalu na starcie
            galleryContainer.style.display = 'none';
            otherSurpriseContainer.style.display = 'none';
            quizContainer.style.display = 'none';

            if (dayType === 'gallery') {
                const apiUrl = card.getAttribute('data-api');
                fetchAndShowGallery(apiUrl);
            } else if (dayType === 'quiz' && day === '2') {
                setupAndShowQuiz();
            } else {
                const surprise = simpleSurprises[day];
                if (surprise) {
                    showSimpleSurprise(surprise);
                }
            }
        });
    });

    async function fetchAndShowGallery(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            photos = data.photos;

            if (photos.length > 0) {
                currentPhotoIndex = 0;
                updateGalleryView();
                galleryContainer.style.display = 'flex';
                modal.style.display = 'flex';
            } else {
                showSimpleSurprise({type: 'text', content: 'Ups, wygląda na to, że nie ma tu jeszcze zdjęć!'});
            }
        } catch (error) {
            console.error('Błąd pobierania zdjęć:', error);
            showSimpleSurprise({type: 'text', content: 'Coś poszło nie tak przy ładowaniu niespodzianki. Spróbuj ponownie.'});
        }
    }

    function showSimpleSurprise(surprise) {
        otherSurpriseContainer.innerHTML = `<p>${surprise.content}</p>`;
        otherSurpriseContainer.style.display = 'flex';
        modal.style.display = 'flex';
    }
    
    // --- NOWOŚĆ: Funkcje do obsługi Quizu ---

    function setupAndShowQuiz() {
        quizAttempts = 0; // Resetuj licznik prób za każdym razem
        const questionEl = document.getElementById('quiz-question');
        const optionsGrid = document.getElementById('quiz-options-grid');
        const feedbackEl = document.getElementById('quiz-feedback');

        questionEl.textContent = quizData.question;
        feedbackEl.textContent = ''; // Wyczyść poprzednie komunikaty
        optionsGrid.innerHTML = ''; // Wyczyść stare opcje

        for (const key in quizData.options) {
            const button = document.createElement('button');
            button.className = 'quiz-option-btn';
            button.innerHTML = `<strong>${key}:</strong> ${quizData.options[key]}`;
            button.addEventListener('click', () => handleAnswer(key));
            optionsGrid.appendChild(button);
        }

        quizContainer.style.display = 'flex';
        modal.style.display = 'flex';
    }

    function handleAnswer(selectedKey) {
        const feedbackEl = document.getElementById('quiz-feedback');

        if (selectedKey === quizData.correctAnswer) {
            // Poprawna odpowiedź
            quizContainer.style.display = 'none';
            otherSurpriseContainer.innerHTML = afterCorrectAnswerQuiz;
            otherSurpriseContainer.style.display = 'flex';
        } else {
            // Niepoprawna odpowiedź
            quizAttempts++;
            if (quizAttempts < 3) {
                feedbackEl.textContent = `Niestety nie. Spróbuj jeszcze raz!`;
            } else if (quizAttempts === 3) {
                feedbackEl.textContent = "Słabo, ale i tak cie kocham, spróbuj jeszcze raz...";
            } else { // quizAttempts > 3
                feedbackEl.textContent = "i jeszcze raz....";
            }
        }
    }

    // --- Koniec nowych funkcji Quizu ---

    function updateGalleryView() {
        if (photos.length === 0) return;

        galleryImage.onload = () => {
            syncDescriptionWidth();
        };

        galleryImage.src = photos[currentPhotoIndex].url;
        galleryDescription.textContent = photos[currentPhotoIndex].description;
    }

    document.querySelector('.left-arrow').addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex > 0) ? currentPhotoIndex - 1 : photos.length - 1;
        updateGalleryView();
    });

    document.querySelector('.right-arrow').addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex < photos.length - 1) ? currentPhotoIndex + 1 : 0;
        updateGalleryView();
    });

    closeButton.addEventListener('click', () => modal.style.display = 'none');
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
    });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') modal.style.display = 'none';
    });
});