#!/bin/sh

v=`git describe --long`

h=`git log -n 1 --pretty=format:"%H"`
#git rev-parse HEAD
#git rev-list --max-count=1 HEAD

pwd=`pwd`
f="${pwd}/readium-module.json"

sed "s/\"version\": \"[^\"]*\"/\"version\": \"${v}\"/" "${f}"\
| sed "s/\"hash\": \"[^\"]*\"/\"hash\": \"${h}\"/"\
> "tmp" && cp "tmp" "${f}" && rm "tmp"

cat "${f}"