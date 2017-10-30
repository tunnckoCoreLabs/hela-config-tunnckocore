#!/bin/bash -eo pipefail

if [ "$CIRCLECI" = "true" ]; then
  echo -e "$NPM_USER\n$NPM_PASS\n$NPM_EMAIL" | npm adduser
  git push --follow-tags
  npm publish
fi;


