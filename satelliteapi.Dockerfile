# Specify the base image
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set the working directory to the service's directory within the container
WORKDIR /usr/src/app

# Assuming this Dockerfile is located at the root of your monorepo,
# and a .dockerignore is present to exclude node_modules
COPY . .


# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

EXPOSE 3001

CMD ["node", "./services/satellite-api/src/index.js"]