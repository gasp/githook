#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- env93.sh  ----------------"
date

#cache
echo "---------------- cache"
cd ~/www/env3/cache
git status
git pull
