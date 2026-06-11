import os
os.environ["DATABASE_URL"] = "sqlite://"
from microservices.videoconferencias.app import create_app

app = create_app()
with app.app_context():
    rules = sorted(app.url_map.iter_rules(), key=lambda r: r.rule)
    print(f"\nTotal endpoints registrados: {len([r for r in rules if '/api/v1' in r.rule])}\n")
    for rule in rules:
        if '/api/v1' in rule.rule:
            methods = ', '.join(sorted(m for m in rule.methods if m not in ('HEAD', 'OPTIONS')))
            print(f"  [{methods}]  {rule.rule}")
