FROM node:14.1.0-slim
COPY . .
RUN rm -rf node_modules && yarn
RUN yarn build
CMD [ "yarn", "start:prod" ]
