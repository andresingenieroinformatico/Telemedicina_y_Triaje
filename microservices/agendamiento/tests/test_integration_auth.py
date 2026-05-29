import unittest
from microservices.videoconferencias.app import create_app, db
from app.models import Usuario


class AuthIntegrationTest(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_register_login_me_flow(self):
        # Register
        resp = self.client.post('/api/v1/auth/register', json={
            'username': 'itest', 'email': 'itest@example.com', 'password': 'password123'
        })
        self.assertEqual(resp.status_code, 201)
        data = resp.get_json()
        self.assertTrue(data['success'])

        # Login
        resp = self.client.post('/api/v1/auth/login', json={'username': 'itest', 'password': 'password123'})
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertTrue(data['success'])
        token = data['data']['access_token']
        self.assertIsNotNone(token)

        # /me
        resp = self.client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['username'], 'itest')

    def test_cookie_login_and_logout(self):
        # Register
        self.client.post('/api/v1/auth/register', json={'username': 'cookieuser', 'email': 'cookie@example.com', 'password': 'password123'})

        # Login with cookie
        resp = self.client.post('/api/v1/auth/login_cookie', json={'username': 'cookieuser', 'password': 'password123'})
        self.assertEqual(resp.status_code, 200)
        # Cookie should be set in Set-Cookie header
        set_cookie = resp.headers.get('Set-Cookie')
        self.assertIsNotNone(set_cookie)

        # Extract cookie and send to /me
        # The test client preserves cookies automatically
        resp = self.client.get('/api/v1/auth/me')
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertTrue(data['success'])

        # Logout
        resp = self.client.post('/api/v1/auth/logout')
        self.assertEqual(resp.status_code, 200)


if __name__ == '__main__':
    unittest.main()
