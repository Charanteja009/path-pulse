FROM node:20-alpine
WORKDIR /app
# We only copy package.json first to make builds faster
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]