FROM node:14.1.0-slim
COPY . .
RUN rm -rf node_modules && npm install
RUN npm run build
CMD [ "npm", "run", "start:prod" ]
