#!/usr/bin/env bash

# This is a very simple script that demonstrates how to load a Dojo
# application on the server using Node.js.

node --debug-brk lib/dojo/dojo.js load=app/main.js $@