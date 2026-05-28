"""Script pequeño para eliminar el usuario de prueba 'inttest_auto'."""
from app import create_app, db
from app.models import Usuario
import os


def main():
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    with app.app_context():
        usuario = Usuario.query.filter_by(username='inttest_auto').first()
        if not usuario:
            print('Usuario no encontrado: inttest_auto')
            return
        db.session.delete(usuario)
        db.session.commit()
        print('Usuario inttest_auto eliminado')


if __name__ == '__main__':
    main()
