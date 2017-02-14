install:
	npm install

run:
	npm run babel-node -- ./src/bin/downloader-bin.js $(1)

build:
	rm -rf dist
	npm run build

publish:
	npm publish

test:
	npm test

test-watch:
	npm run testwatch

lint:
	npm run eslint -- src __tests__

.PHONY: test
