FROM node:20-alpine
WORKDIR /app
# We only copy package.json first to make builds faster
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3002
CMD ["npm", "start"]