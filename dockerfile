FROM ghcr.io/puppeteer/puppeteer:21.6.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY yarn.lock ./
RUN yarn autoclean --init --force
COPY . .
RUN chmod -R 777 /usr/src/app/login
CMD ["node", "index.js"]