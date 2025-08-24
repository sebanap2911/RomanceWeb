# --- SEKCJA 1: IMPORTY ---
import os
import json
from flask import Flask, render_template, jsonify, url_for
# --- KONIEC SEKCJI 1 ---


# --- SEKCJA 2: INICJALIZACJA APLIKACJI FLASK ---
app = Flask(__name__)
# --- KONIEC SEKCJI 2 ---


# --- SEKCJA 3: WCZYTYWANIE DANYCH Z PLIKU JSON ---
def load_descriptions():
    """
    Wczytuje i parsuje dane z pliku descriptions.json.
    Zwraca pusty słownik w przypadku błędu.
    """
    try:
        # 'utf-8' jest ważne dla polskich znaków
        with open('descriptions.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("BŁĄD: Nie znaleziono pliku 'descriptions.json'.")
        return {}
    except json.JSONDecodeError:
        print("BŁĄD: Plik 'descriptions.json' ma niepoprawny format.")
        return {}

DESCRIPTIONS = load_descriptions()
# --- KONIEC SEKCJI 3 ---


# --- SEKCJA 4: DEFINICJE ŚCIEŻEK (ROUTES) ---

@app.route('/')
def index():
    """Renderuje główną stronę aplikacji (index.html)."""
    return render_template('index.html')


@app.route('/api/photos/day1')
def get_day1_photos():
    """
    Zwraca dane do galerii dla Dnia 1 w formacie JSON.
    Dane o zdjęciach i opisach pobierane są z wczytanego pliku.
    """
    photo_folder = os.path.join(app.static_folder, 'Day1')
    photos_data = []
    
    # Pobieramy opisy specyficzne dla 'day1' z globalnej zmiennej DESCRIPTIONS
    photo_descriptions_day1 = DESCRIPTIONS.get('day1', {})

    if os.path.exists(photo_folder):
        # Sortujemy pliki, aby zapewnić stałą kolejność
        for filename in sorted(os.listdir(photo_folder)):
            # Dodajemy zdjęcie do listy tylko jeśli ma zdefiniowany opis
            if filename in photo_descriptions_day1:
                photos_data.append({
                    'url': url_for('static', filename=f'Day1/{filename}'),
                    'description': photo_descriptions_day1[filename]
                })

    return jsonify(photos=photos_data)

# --- KONIEC SEKCJI 4 ---


# --- SEKCJA 5: URUCHOMIENIE APLIKACJI ---
if __name__ == '__main__':
    # Uruchamia serwer deweloperski Flaska
    # debug=True sprawia, że serwer automatycznie restartuje się po zmianach w kodzie
    app.run(debug=True)
# --- KONIEC SEKCJI 5 ---