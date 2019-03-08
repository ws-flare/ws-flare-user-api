FROM node:10-alpine AS build

COPY . ./app

WORKDIR ./app

RUN yarn --production --ignore-engines

RUN rm yarn.lock && rm .npmrc && rm .yarnclean

FROM alpine AS prod

RUN apk add nodejs-lts

COPY --from=build /app .

EXPOSE 80

CMD ["node", "."]
