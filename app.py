from flask import Flask, send_from_directory
from flask_cors import CORS
import os
from backend.core.config import Config
from backend.models.trade import db
from backend.api.routes import api_bp

def create_app():
    app = Flask(__name__, static_folder='frontend/dist')
    app.config.from_object(Config)

    # Initialize Extensions
    CORS(app)
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(api_bp, url_prefix='/api')

    # Create Database Tables
    with app.app_context():
        db.create_all()

    # Serve React Frontend (Production)
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(app.static_folder + '/' + path):
            return send_from_directory(app.static_folder, path)
        else:
            # Fallback to index.html for SPA routing
            if os.path.exists(os.path.join(app.static_folder, 'index.html')):
                return send_from_directory(app.static_folder, 'index.html')
            return "Backend API is running. Frontend not found.", 200

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
