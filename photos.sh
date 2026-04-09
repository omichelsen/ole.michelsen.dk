#!/bin/bash

# for f in src/photos/miata/*.jpeg; do mv "$f" "$(echo "$f" | sed s/ \- /\-/)"; done

echo "miata"
identify -format '%f %wx%h\n' src/photos/miata/converted/*@1x.jpg
echo "brz"
identify -format '%f %wx%h\n' src/photos/brz/converted/jpg/*@1x.jpg