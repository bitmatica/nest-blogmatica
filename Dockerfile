FROM node:14.1.0-slim
COPY . .
RUN rm -rf node_modules && npm install
CMD [ "npm", "run", "start:prod" ]
