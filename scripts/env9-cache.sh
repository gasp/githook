#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- env9.sh  ----------------"
date

#cache
echo "---------------- cache"
cd ~/www/env9/cache
git status
git pull
