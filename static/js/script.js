document.addEventListener('DOMContentLoaded', () => {

    // --- SEKCJA 1: KONFIGURACJA NIESPODZIANEK ---

    // Konfiguracja prostych niespodzianek tekstowych
    const simpleSurprises = {
        3: { type: 'text', content: 'Dzień trzeci! Ciekaw jestem, czy zgadniesz, co będzie jutro...' },
        7: { type: 'text', content: 'To już koniec! Dziękuję za wspólną zabawę. Kocham Cię! ❤️' }
    };

    // Konfiguracja danych dla quizu
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
    
    // --- KONIEC SEKCJI 1 ---


    // --- SEKCJA 2: GŁÓWNE ZMIENNE I SELEKTORY DOM ---

    // Zmienne do obsługi galerii
    let currentPhotoIndex = 0;
    let photos = [];

    // Zmienna do obsługi quizu
    let quizAttempts = 0;

    // Selektory elementów DOM
    const dayCards = document.querySelectorAll('.day-card');
    const modal = document.getElementById('surprise-modal');
    const closeButton = document.querySelector('.close-button');
    
    // Kontenery w modalu
    const galleryContainer = document.getElementById('photo-gallery');
    const otherSurpriseContainer = document.getElementById('other-surprise');
    const quizContainer = document.getElementById('quiz-container');

    // Elementy galerii
    const galleryImage = document.getElementById('gallery-image');
    const galleryDescription = document.getElementById('gallery-description');
    
    // --- KONIEC SEKCJI 2 ---


    // --- SEKCJA 3: LOGIKA POWITALNEGO OKNA ---

    const welcomeModal = document.getElementById('welcome-modal');
    const startButton = document.getElementById('start-button');

    if (welcomeModal && startButton) {
        startButton.addEventListener('click', () => {
            welcomeModal.style.display = 'none';
        });
    }

    // --- KONIEC SEKCJI 3 ---


    // --- SEKCJA 4: GŁÓWNY ROUTER APLIKACJI (KLIKNIĘCIA W KARTY) ---

    dayCards.forEach(card => {
        card.addEventListener('click', () => {
            const day = card.getAttribute('data-day');
            const dayType = card.getAttribute('data-type');
            
            // Resetowanie widoczności kontenerów w modalu
            galleryContainer.style.display = 'none';
            otherSurpriseContainer.style.display = 'none';
            quizContainer.style.display = 'none';

            // Wybór akcji w zależności od typu niespodzianki
            if (dayType === 'gallery') {
                const apiUrl = card.getAttribute('data-api');
                fetchAndShowGallery(apiUrl);
            } else if (dayType === 'quiz') {
                setupAndShowQuiz();
            } else {
                const surprise = simpleSurprises[day];
                if (surprise) {
                    showSimpleSurprise(surprise);
                }
            }
        });
    });

    // --- KONIEC SEKCJI 4 ---


    // --- SEKCJA 5: FUNKCJE ZWIĄZANE Z GALERIĄ ZDJĘĆ ---

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

    function updateGalleryView() {
        if (photos.length === 0) return;

        galleryImage.onload = () => syncDescriptionWidth();
        galleryImage.src = photos[currentPhotoIndex].url;
        galleryDescription.textContent = photos[currentPhotoIndex].description;
    }

    function syncDescriptionWidth() {
        if (galleryImage && galleryDescription) {
            galleryDescription.style.width = `${galleryImage.offsetWidth}px`;
        }
    }

    // Obserwator do synchronizacji szerokości opisu ze zdjęciem
    const observer = new ResizeObserver(() => {
        if (modal.style.display === 'flex' && galleryContainer.style.display !== 'none') {
            syncDescriptionWidth();
        }
    });
    observer.observe(galleryImage);
    
    // --- KONIEC SEKCJI 5 ---


    // --- SEKCJA 6: FUNKCJE ZWIĄZANE Z QUIZEM ---

    function setupAndShowQuiz() {
        quizAttempts = 0; // Resetuj licznik prób
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

    // --- KONIEC SEKCJI 6 ---


    // --- SEKCJA 7: OGÓLNE FUNKCJE POMOCNICZE ---

    function showSimpleSurprise(surprise) {
        otherSurpriseContainer.innerHTML = `<p>${surprise.content}</p>`;
        otherSurpriseContainer.style.display = 'flex';
        modal.style.display = 'flex';
    }
    
    // --- KONIEC SEKCJI 7 ---


    // --- SEKCJA 8: LISTENERY DO OBSŁUGI NAWIGACJI I MODALA ---

    // Strzałki w galerii
    document.querySelector('.left-arrow').addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex > 0) ? currentPhotoIndex - 1 : photos.length - 1;
        updateGalleryView();
    });

    document.querySelector('.right-arrow').addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex < photos.length - 1) ? currentPhotoIndex + 1 : 0;
        updateGalleryView();
    });

    // Zamykanie okna modalnego
    closeButton.addEventListener('click', () => modal.style.display = 'none');
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
    });
    
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') modal.style.display = 'none';
    });
    
    // --- KONIEC SEKCJI 8 ---

});document.addEventListener('DOMContentLoaded', () => {

    // --- SEKCJA 1: KONFIGURACJA NIESPODZIANEK ---

    // Konfiguracja prostych niespodzianek tekstowych
    const simpleSurprises = {
        3: { type: 'text', content: 'Dzień trzeci! Ciekaw jestem, czy zgadniesz, co będzie jutro...' },
        7: { type: 'text', content: 'To już koniec! Dziękuję za wspólną zabawę. Kocham Cię! ❤️' }
    };

    // Konfiguracja danych dla quizu
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
    
    // --- KONIEC SEKCJI 1 ---


    // --- SEKCJA 2: GŁÓWNE ZMIENNE I SELEKTORY DOM ---

    // Zmienne do obsługi galerii
    let currentPhotoIndex = 0;
    let photos = [];

    // Zmienna do obsługi quizu
    let quizAttempts = 0;

    // Selektory elementów DOM
    const dayCards = document.querySelectorAll('.day-card');
    const modal = document.getElementById('surprise-modal');
    const closeButton = document.querySelector('.close-button');
    
    // Kontenery w modalu
    const galleryContainer = document.getElementById('photo-gallery');
    const otherSurpriseContainer = document.getElementById('other-surprise');
    const quizContainer = document.getElementById('quiz-container');

    // Elementy galerii
    const galleryImage = document.getElementById('gallery-image');
    const galleryDescription = document.getElementById('gallery-description');
    
    // --- KONIEC SEKCJI 2 ---


    // --- SEKCJA 3: LOGIKA POWITALNEGO OKNA ---

    const welcomeModal = document.getElementById('welcome-modal');
    const startButton = document.getElementById('start-button');

    if (welcomeModal && startButton) {
        startButton.addEventListener('click', () => {
            welcomeModal.style.display = 'none';
        });
    }

    // --- KONIEC SEKCJI 3 ---


    // --- SEKCJA 4: GŁÓWNY ROUTER APLIKACJI (KLIKNIĘCIA W KARTY) ---

    dayCards.forEach(card => {
        card.addEventListener('click', () => {
            const day = card.getAttribute('data-day');
            const dayType = card.getAttribute('data-type');
            
            // Resetowanie widoczności kontenerów w modalu
            galleryContainer.style.display = 'none';
            otherSurpriseContainer.style.display = 'none';
            quizContainer.style.display = 'none';

            // Wybór akcji w zależności od typu niespodzianki
            if (dayType === 'gallery') {
                const apiUrl = card.getAttribute('data-api');
                fetchAndShowGallery(apiUrl);
            } else if (dayType === 'quiz') {
                setupAndShowQuiz();
            } else {
                const surprise = simpleSurprises[day];
                if (surprise) {
                    showSimpleSurprise(surprise);
                }
            }
        });
    });

    // --- KONIEC SEKCJI 4 ---


    // --- SEKCJA 5: FUNKCJE ZWIĄZANE Z GALERIĄ ZDJĘĆ ---

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

    function updateGalleryView() {
        if (photos.length === 0) return;

        galleryImage.onload = () => syncDescriptionWidth();
        galleryImage.src = photos[currentPhotoIndex].url;
        galleryDescription.textContent = photos[currentPhotoIndex].description;
    }

    function syncDescriptionWidth() {
        if (galleryImage && galleryDescription) {
            galleryDescription.style.width = `${galleryImage.offsetWidth}px`;
        }
    }

    // Obserwator do synchronizacji szerokości opisu ze zdjęciem
    const observer = new ResizeObserver(() => {
        if (modal.style.display === 'flex' && galleryContainer.style.display !== 'none') {
            syncDescriptionWidth();
        }
    });
    observer.observe(galleryImage);
    
    // --- KONIEC SEKCJI 5 ---


    // --- SEKCJA 6: FUNKCJE ZWIĄZANE Z QUIZEM ---

    function setupAndShowQuiz() {
        quizAttempts = 0; // Resetuj licznik prób
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

    // --- KONIEC SEKCJI 6 ---


    // --- SEKCJA 7: OGÓLNE FUNKCJE POMOCNICZE ---

    function showSimpleSurprise(surprise) {
        otherSurpriseContainer.innerHTML = `<p>${surprise.content}</p>`;
        otherSurpriseContainer.style.display = 'flex';
        modal.style.display = 'flex';
    }
    
    // --- KONIEC SEKCJI 7 ---


    // --- SEKCJA 8: LISTENERY DO OBSŁUGI NAWIGACJI I MODALA ---

    // Strzałki w galerii
    document.querySelector('.left-arrow').addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex > 0) ? currentPhotoIndex - 1 : photos.length - 1;
        updateGalleryView();
    });

    document.querySelector('.right-arrow').addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex < photos.length - 1) ? currentPhotoIndex + 1 : 0;
        updateGalleryView();
    });

    // Zamykanie okna modalnego
    closeButton.addEventListener('click', () => modal.style.display = 'none');
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
    });
    
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') modal.style.display = 'none';
    });
    
    // --- KONIEC SEKCJI 8 ---

});