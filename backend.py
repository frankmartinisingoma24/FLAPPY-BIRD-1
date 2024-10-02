import os
import random
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Get the directory of the current file
current_dir = os.path.dirname(os.path.abspath(__file__))
# Set the static folder to be in the same directory as this file
static_folder = os.path.join(current_dir, 'static')

app = Flask(__name__, static_url_path='', static_folder=static_folder)
CORS(app)

class Bird:
    def __init__(self):
        self.y = 250
        self.velocity = 0

    def flap(self):
        self.velocity = -5

    def update(self):
        self.velocity += 0.5
        self.y += self.velocity
        self.y = max(0, min(500, self.y))

class Pipe:
    def __init__(self):
        self.x = 400
        self.gap_start = random.randint(100, 400)
        self.gap_size = 150

    def update(self):
        self.x -= 2

game_state = {
    "bird": Bird(),
    "pipes": [Pipe()],
    "score": 0
}

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/update', methods=['POST'])
def update_game():
    action = request.json.get('action')
    
    if action == 'flap':
        game_state['bird'].flap()
    
    game_state['bird'].update()
    
    for pipe in game_state['pipes']:
        pipe.update()
    
    if game_state['pipes'][-1].x < 200:
        game_state['pipes'].append(Pipe())
    
    if game_state['pipes'][0].x < -50:
        game_state['pipes'].pop(0)
        game_state['score'] += 1
    
    for pipe in game_state['pipes']:
        if (pipe.x < 50 and pipe.x > -50 and
            (game_state['bird'].y < pipe.gap_start or
             game_state['bird'].y > pipe.gap_start + pipe.gap_size)):
            return jsonify({"game_over": True, "score": game_state['score']})
    
    return jsonify({
        "bird_y": game_state['bird'].y,
        "pipes": [{"x": p.x, "gap_start": p.gap_start, "gap_size": p.gap_size} for p in game_state['pipes']],
        "score": game_state['score']
    })

if __name__ == '__main__':
    print(f"Static folder is set to: {static_folder}")
    app.run(debug=True)