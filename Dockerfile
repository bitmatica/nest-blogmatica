FROM node:14.1.0
RUN npm i -g npm

WORKDIR '/app'

COPY . .
# TODO: This is not optimized, just a fix to deal with local copied-over node_modules causing issues with docker build
RUN rm -rf node_modules
RUN rm -rf dist
RUN npm install
RUN npm run build

CMD ["npm", "run", "start:prod"]
