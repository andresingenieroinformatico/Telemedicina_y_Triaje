.PHONY: venv install run docker

venv:
	python -m venv .venv

install: venv
	. .venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

run:
	. .venv/bin/activate && python run.py

docker:
	docker compose up --build
