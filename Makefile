TEST = NODE_PATH=$NODE_PATH:./src yarn run jest

setup:
	@node ./scripts/before-tests.js

teardown:
	-@kill -9 -$(shell cat .ddb_pid)

test:
	@$(MAKE) setup
	@${TEST}
	@$(MAKE) teardown

test_coverage:
	@$(MAKE) setup
	@${TEST} -- --coverage
	@$(MAKE) teardown

test_watch:
	@$(MAKE) setup
	@${TEST} -- --watch
	@$(MAKE) teardown

test_watch_coverage:
	@$(MAKE) setup
	@${TEST} -- --watch --coverage
	@$(MAKE) teardown
