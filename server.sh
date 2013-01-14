#!/usr/bin/env bash

# This is a very simple script that demonstrates how to load a Dojo
# application on the server using Node.js.

INITED = ".inited"

if [ -n "$DOTCLOUD_PROJECT1" ]; then
	if [ ! -f "$INITED" ]; then
		node initdb.js
		if [ $? -eq 0 ]; then
			touch "$INITED"
		fi
	fi
fi

if [ "$NODE_ENV" == "development"]; then
	DEBUG = "--debug"
fi

node "$DEBUG" lib/dojo/dojo.js load=app/main.js $@