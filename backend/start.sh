python manage.py makemigrations
python manage.py migrate
python manage.py runserver $SERVER_ADDRESS &
python -m celery -A taskstorm worker &
wait
