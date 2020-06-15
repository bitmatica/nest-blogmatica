FROM node:lts-slim
COPY . .
RUN rm -rf node_modules && yarn
CMD [ "yarn", "start:prod" ]
