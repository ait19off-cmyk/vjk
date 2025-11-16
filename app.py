from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory storage for game statistics
game_stats = {
    "total_games": 0,
    "player_wins": 0,
    "ai_wins": 0,
    "highest_score": 0
}

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get game statistics"""
    return jsonify(game_stats)

@app.route('/api/stats', methods=['POST'])
def update_stats():
    """Update game statistics"""
    global game_stats
    
    try:
        data = request.get_json()
        if data is None:
            return jsonify({"error": "No JSON data provided"}), 400
            
        # Update stats based on game result
        if 'result' in data:
            game_stats["total_games"] += 1
            if data['result'] == 'player_win':
                game_stats["player_wins"] += 1
            elif data['result'] == 'ai_win':
                game_stats["ai_wins"] += 1
                
        # Update highest score if provided
        if 'score' in data and isinstance(data['score'], int):
            if data['score'] > game_stats["highest_score"]:
                game_stats["highest_score"] = data['score']
                
        return jsonify({"message": "Stats updated!", "stats": game_stats}), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)