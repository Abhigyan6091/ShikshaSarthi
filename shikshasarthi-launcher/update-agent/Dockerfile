FROM docker:dind

RUN apk add --no-cache curl bash

WORKDIR /app
COPY update.sh .
RUN chmod +x update.sh

# The parent directory will be mounted to /app to access docker-compose.yml and .env
# The docker socket will be mounted to /var/run/docker.sock

CMD ["./update.sh"]
