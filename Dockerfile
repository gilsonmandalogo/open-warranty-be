FROM node:14-alpine

WORKDIR /usr/src/app

RUN mkdir -p public/images
COPY package.json yarn.lock ./
RUN yarn
COPY public/*.* ./public
COPY public/static ./public/static
COPY ormconfig.json tsconfig.json ./
COPY src ./src

EXPOSE 4000

CMD ["yarn", "start:prod"]
