FROM ghcr.io/puppeteer/puppeteer:21.6.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY yarn.lock ./
RUN yarn autoclean --init --force
COPY . .
USER root  # Switch to root user
RUN groupadd -r puppeteer && useradd -r -g puppeteer puppeteer  # Create puppeteer user and group
RUN chown -R puppeteer:puppeteer /usr/src/app/login  # Change ownership
RUN chmod -R 777 /usr/src/app/login  # Change permissions
USER puppeteer  # Switch back to original user
CMD ["node", "index.js"]
