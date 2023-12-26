FROM nginx:alpine

# Copy build artifacts to the nginx directory
COPY /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf