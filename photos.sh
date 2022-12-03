#!/bin/bash

# for f in src/photos/miata/*.jpeg; do mv "$f" "$(echo "$f" | sed s/ \- /\-/)"; done

identify -format '%f %wx%h\n' src/photos/miata/*.jpg