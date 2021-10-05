FROM node:14-alpine

WORKDIR /usr/src/app

RUN mkdir -p public/images
COPY public/*.* ./public
COPY public/static ./public/static
COPY ormconfig.json ./
COPY package.json yarn.lock ./
RUN yarn --prod
COPY build/src ./src

EXPOSE 4000

CMD ["yarn", "start:prod"]
