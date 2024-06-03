python manage.py makemigrations
python manage.py migrate
daphne -b $SERVER_IP -p $SERVER_PORT taskstorm.asgi:application &
#python manage.py runserver $SERVER_ADDRESS &
python -m celery -A taskstorm worker -l INFO &
python -m celery -A taskstorm beat -s celerybeat-schedule &
wait
