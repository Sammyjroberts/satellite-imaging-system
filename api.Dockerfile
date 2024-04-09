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

# Your app binds to port 8080, so use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000

CMD ["node", "./services/api/src/index.js"]