FROM ghcr.io/puppeteer/puppeteer:21.6.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    PORT=3000

WORKDIR /usr/src/app

COPY yarn.lock ./
RUN yarn autoclean --init --force
COPY . .
USER root
RUN groupadd -r puppeteer && useradd -r -g puppeteer puppeteer
RUN chown -R puppeteer:puppeteer /usr/src/app
RUN chmod -R 777 /usr/src/app/login
USER puppeteer
CMD ["node", "index.js"]
