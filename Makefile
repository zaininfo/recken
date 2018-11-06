BIN = ./node_modules/.bin

.PHONY: bootstrap lint

bootstrap: node_modules

node_modules: yarn.lock package.json
	@yarn
	@touch node_modules

lint:
	@$(BIN)/standard
