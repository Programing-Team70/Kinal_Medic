FROM node:20-alpine
RUN npm i -g pnpm
WORKDIR /app
COPY package.json ./
RUN pnpm config set node-linker hoisted
RUN pnpm install
COPY . .
EXPOSE 3000
CMD ["pnpm", "exec", "node", "index.js"]