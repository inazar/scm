#!/usr/bin/env bash

if which node >/dev/null; then

	set -e

	# Source directory for unbuilt code
	SRCDIR=$(cd $(dirname $0) && pwd)

	# Directory containing dojo build utilities
	TOOLSDIR="$SRCDIR/lib/util/buildscripts"

	# Destination directory for built code
	DISTDIR="$SRCDIR/production"

	# Module ID of the main application package loader configuration
	LOADERMID="app/main"

	# Main application package loader configuration
	LOADERCONF="$SRCDIR/$LOADERMID.js"

	# Main application package build configuration
	PROFILE="$SRCDIR/profiles/app.profile.js"

	# Configuration over. Main application start up!

	if [ ! -d "$TOOLSDIR" ]; then
		echo "Can't find Dojo build tools -- did you initialise submodules? (git submodule update --init --recursive)"
		exit 1
	fi

	echo "Building application with $PROFILE to $DISTDIR."

	echo -n "Cleaning old files..."
	rm -rf "$DISTDIR"
	echo " Done"

	cd "$TOOLSDIR"

	node ../../dojo/dojo.js load=build --require "$LOADERCONF" --profile "$PROFILE" --releaseDir "$DISTDIR" $@

	find "$DISTDIR" -name *.js.uncompressed.js -delete
	find "$DISTDIR" -name *.js.consoleStripped.js -delete

	echo "Build complete"
else
	echo "Require node to procees"
	exit 1
fi