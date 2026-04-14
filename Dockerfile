# Stage 1: Build the React frontend
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Setup the Express backend and serve the frontend
FROM node:18-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production

# Copy backend source
COPY server/src ./src
COPY schema.sql ../schema.sql

# Copy built frontend from Stage 1 into client/dist (as expected by server/src/index.js)
COPY --from=client-builder /app/client/dist /app/client/dist

EXPOSE 3000
CMD ["node", "src/index.js"]
