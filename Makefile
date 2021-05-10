setup:
	install create-config db-migrate

set-config:
	cp .env.example .env || true

run:
	npm start

install:
	npm install

db-migrate:
	npx knex migrate:latest

build:
	npm run build

start:
	heroku local -f Procfile.dev

start-backend:
	npx nodemon --exec npx babel-node server/bin/server.js

start-frontend:
	npx webpack serve

lint:
	npx eslint .

test:
	npm test

test-coverage:
	npm test -- --coverage