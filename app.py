import os
from flask import Flask, render_template, jsonify, url_forurl_for

app = Flask(__name__)

# --- KONFIGURACJA ZDJĘĆ I OPISÓW DLA DNIA 1 ---
# W tym miejscu mapujesz nazwy plików z folderu 'static/Day1' na opisy.
# Dzięki temu opisy są oddzielone od nazw plików.
PHOTO_DESCRIPTIONS_DAY1 = {
    'p1.jpg': "Chwila spokoju i Ty. Moja ulubiona kombinacja. ❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️",
    'p2.jpg': "Chwila spokoju i Ty. Moja ulubiona kombinacja. ❤️",
    'p3.jpg': "Chwila spokoju i Ty. Moja ulubiona kombinacja. ❤️"
}
# --- KONIEC KONFIGURACJI ---


@app.route('/')
def index():
    """Główny widok, który renderuje naszą stronę HTML."""
    return render_template('index.html')

@app.route('/api/photos/day1')
def get_day1_photos():
    """
    To jest nasze API. Zwraca listę zdjęć i opisów w formacie JSON.
    Frontend (JavaScript) odpyta ten adres, aby pobrać dane do galerii.
    """
    photo_folder = os.path.join(app.static_folder, 'Day1')
    photos_data = []

    # Sprawdzamy, które pliki z folderu mają zdefiniowany opis
    if os.path.exists(photo_folder):
        for filename in sorted(os.listdir(photo_folder)):
            if filename in PHOTO_DESCRIPTIONS_DAY1:
                photos_data.append({
                    'url': url_for('static', filename=f'Day1/{filename}'),
                    'description': PHOTO_DESCRIPTIONS_DAY1[filename]
                })

    return jsonify(photos=photos_data)


if __name__ == '__main__':
    # Uruchamiamy aplikację w trybie debugowania
    app.run(debug=True)