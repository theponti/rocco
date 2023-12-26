# Stage 1: Build the React app
FROM node:14 as build

WORKDIR /app

COPY build /app/

# Stage 2: Serve the built app using Nginx
FROM nginx:1.21-alpine

COPY --from=build /app /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
