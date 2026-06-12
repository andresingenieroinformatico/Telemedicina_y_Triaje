import os
from flask import Flask
from flask_cors import CORS
from triage.triage import triage_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(triage_bp)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
