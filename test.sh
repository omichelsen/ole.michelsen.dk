#!/bin/bash

set -eu

# https://github.com/gjtorikian/html-proofer/blob/master/bin/htmlproofer
bundle exec htmlproofer \
  public \
  --ignore-files /mmt/site/,/.git/ \
  --only-4xx \
  --ignore-status-codes 400,401