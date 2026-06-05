from microservices.videoconferencias.app import create_app, db


def run():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        client = app.test_client()
        r = client.post('/api/v1/auth/register', json={'username':'cookieuser','email':'cookie@example.com','password':'password123'})
        print('register', r.status_code, r.get_json())
        r2 = client.post('/api/v1/auth/login_cookie', json={'username':'cookieuser','password':'password123'})
        print('login_cookie status:', r2.status_code)
        try:
            print('login_cookie json:', r2.get_json())
        except Exception as e:
            print('no json:', e)
        print('headers:', dict(r2.headers))
        r3 = client.get('/api/v1/auth/me')
        print('/me status:', r3.status_code, 'json:', r3.get_json())


if __name__ == '__main__':
    run()
