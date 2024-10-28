FROM node:21.6.1-alpine
RUN mkdir app
WORKDIR /app
COPY . .
RUN npm install
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["npm","run","dev","--","--host"]
# CMD node ./dist/server/entry.mjs