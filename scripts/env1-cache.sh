#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- env93.sh  ----------------"
date

#cache
echo "---------------- cache"
cd ~/www/env1/cache
git status
git pull
