FROM python:3.12.1-alpine3.19

WORKDIR /app

COPY requirements.txt requirements.txt
COPY start.sh start.sh
RUN pip3 install -r requirements.txt
RUN chmod +x ./start.sh

COPY . .

CMD chmod +x ./start.sh ; ./start.sh
