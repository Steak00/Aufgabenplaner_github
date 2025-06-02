# frontend/Dockerfile
FROM node:18-alpine AS angular
WORKDIR /app
COPY . .
RUN npm install && npm run build --prod

# Debug: List the contents of the /app/dist folder
RUN ls -la /app/dist/app

# Production container
FROM nginx:alpine
COPY --from=angular /app/dist/app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R 755 /usr/share/nginx/html
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]