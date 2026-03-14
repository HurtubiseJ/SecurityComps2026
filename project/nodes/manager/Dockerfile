FROM node:21-alpine AS build
WORKDIR /app
ENV VITE_LOCAL=true
COPY /nodes/manager/package*.json ./
RUN npm install
COPY /nodes/manager/. .
RUN npm run build


FROM nginx:alpine AS production
ENV VITE_LOCAL=true
COPY --from=build /app/dist /usr/share/nginx/html
COPY /nodes/manager/nginx.conf /etc/nginx/conf.d/default.conf  
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
