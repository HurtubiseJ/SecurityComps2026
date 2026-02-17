# Stage 1: Build the React application
FROM node:21-alpine AS build
WORKDIR /app
COPY /nodes/manager/package*.json ./
RUN npm install
COPY /nodes/manager/. .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# FROM node:21-alpine

# WORKDIR /app

# COPY nodes/manager/package*.json ./
# RUN npm install

# COPY nodes/manager/ .

# EXPOSE 5173 

# CMD ["npm", "run", "dev"]
