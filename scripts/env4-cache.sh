#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- env4.sh  ----------------"
date

#cache
echo "---------------- cache"
cd ~/www/env4/cache
git status
git pull
