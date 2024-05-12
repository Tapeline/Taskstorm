python manage.py makemigrations
python manage.py migrate
python manage.py runserver $SERVER_ADDRESS &
python -m celery -A taskstorm worker -l INFO &
python -m celery -A taskstorm beat -s celerybeat-schedule &
wait
