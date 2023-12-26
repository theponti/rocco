FROM nginx:alpine

# Copy application to 
COPY . /app

# Echo the current working directory's contents
RUN ls -la /app

# Copy build artifacts to the nginx directory
COPY /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf