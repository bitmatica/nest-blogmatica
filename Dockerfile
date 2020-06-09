FROM node:lts-slim
COPY . .
RUN rm -rf node_modules && yarn
RUN yarn build
CMD [ "yarn", "start:prod" ]
