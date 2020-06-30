#!/bin/bash

set -eu

# https://github.com/gjtorikian/html-proofer/blob/master/bin/htmlproofer
bundle exec htmlproofer \
  public \
  --file-ignore /mmt/site/,/.git/ \
  --check-favicon \
  --check-html \
  --check-opengraph \
  --only-4xx \
  --http-status-ignore 400,401