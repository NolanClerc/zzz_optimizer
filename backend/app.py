import os
import json
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

JSON_FOLDER = 'json'

def sort_json(data):
    """Recursively sorts a JSON object by key."""
    if isinstance(data, dict):
        return {k: sort_json(v) for k, v in sorted(data.items())}
    elif isinstance(data, list):
        return [sort_json(item) for item in data]
    else:
        return data

@app.route('/character_ids', methods=['GET'])
def get_character_ids():
    file_path = os.path.join(JSON_FOLDER, 'character_filtered.json')
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            sorted_data = sort_json(data)  # Sort the JSON data
            return jsonify(sorted_data)
    except FileNotFoundError:
        return jsonify({"error": "Character ID file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Error decoding Character ID JSON"}), 500

@app.route('/characters/<char_id>', methods=['GET'])
def get_character_details(char_id):
    char_file = os.path.join(JSON_FOLDER, f"{char_id}.json")

    if os.path.exists(char_file):
        try:
            with open(char_file, 'r', encoding='utf-8') as file:
                char_data = json.load(file)
                sorted_char_data = sort_json(char_data)  # Sort the JSON data
                return jsonify(sorted_char_data)
        except json.JSONDecodeError as e:
            print(f"Erreur de décodage JSON dans le fichier {char_file}: {e}")
            return jsonify({"error": "Erreur de décodage du fichier JSON"}), 500
        except Exception as e:
            print(f"Erreur inattendue lors de la lecture du fichier {char_file}: {e}")
            return jsonify({"error": "Erreur inattendue lors de la lecture du fichier"}), 500
    else:
        return jsonify({"error": "Character not found"}), 404

@app.route('/weapons/<weapon_id>', methods=['GET'])
def get_weapon_details(weapon_id):
    weapon_file = os.path.join(JSON_FOLDER, f"{weapon_id}.json")

    if os.path.exists(weapon_file):
        try:
            with open(weapon_file, 'r', encoding='utf-8') as file:
                weapon_data = json.load(file)
                sorted_weapon_data = sort_json(weapon_data)  # Sort the JSON data
                return jsonify(sorted_weapon_data)
        except json.JSONDecodeError as e:
            print(f"Erreur de décodage JSON dans le fichier {weapon_file}: {e}")
            return jsonify({"error": "Erreur de décodage du fichier JSON"}), 500
        except Exception as e:
            print(f"Erreur inattendue lors de la lecture du fichier {weapon_file}: {e}")
            return jsonify({"error": "Erreur inattendue lors de la lecture du fichier"}), 500
    else:
        return jsonify({"error": "Weapon not found"}), 404

@app.route('/weapon_ids', methods=['GET'])
def get_weapon_ids():
    file_path = os.path.join(JSON_FOLDER, 'weapons.json')
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            sorted_data = sort_json(data)  # Sort the JSON data
            return jsonify(sorted_data)
    except FileNotFoundError:
        return jsonify({"error": "Weapon ID file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Error decoding Weapon ID JSON"}), 500

@app.route('/characters', methods=['GET'])
def get_all_characters():
    # Charger les données de tous les personnages ici
    all_characters = load_all_characters()  # Ta fonction pour charger tous les personnages
    return jsonify(all_characters)

if __name__ == '__main__':
    app.run(debug=True)