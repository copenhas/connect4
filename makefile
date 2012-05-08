build: clean test
	hem build

test: lint
	jasmine-node .

specs: lint
	jasmine-node --verbose .

lint:
	jshint spec/
	jshint app/

server: build
	node server.js

clean:
	rm -f public/application.css
	rm -f public/application.js

init:
	npm install -g jasmine-node
	npm install -g hem
	npm install -g jshint
	npm install express
	npm install socket.io
	npm install jqueryify
	npm install guid
