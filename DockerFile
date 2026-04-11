# ============================
# STAGE 1 — Build Angular
# ============================
FROM node:18 AS build

WORKDIR /app

# Copia SOLO package.json → permette a Docker di usare la cache
COPY package*.json ./

# Installa dipendenze (usa cache se package.json non cambia)
RUN npm install

# Copia il resto del progetto
COPY . .

# Build Angular in modalità produzione
RUN npm run build --prod


# ============================
# STAGE 2 — Nginx (runtime)
# ============================
FROM nginx:alpine

# Copia la build Angular
COPY --from=build /app/dist/reshare/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
