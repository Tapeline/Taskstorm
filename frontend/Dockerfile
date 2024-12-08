FROM node:alpine
WORKDIR /app
COPY package.json .
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 3000
#CMD ["API_BASE_URL=taskstorm.tapeline.dev/api/",
#     "API_WS_URL=wss://taskstorm.tapeline.dev/ws/",
#     "npm", "run", "dev", "--", "--host", "--port", "3000"]
CMD chmod +x ./start.sh ; ./start.sh
