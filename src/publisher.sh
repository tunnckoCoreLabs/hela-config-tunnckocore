#!/bin/bash

if [ "$CIRCLECI" = "true" ]; then
  echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
  npm publish
fi;


