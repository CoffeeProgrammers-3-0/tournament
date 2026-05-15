FROM node:20-bullseye

WORKDIR /app

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

RUN apt-get update && apt-get install -y \
    fonts-liberation \
    fonts-noto \
    fonts-dejavu \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

RUN npx playwright install --with-deps chromium

COPY . .

EXPOSE 3001

CMD ["npm", "start"]