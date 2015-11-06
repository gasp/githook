#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- env9.sh  ----------------"
date

#cache
echo "---------------- cache"
cd ~/www/envdevrow/cache
git status
git pull
echo 'flush_all' | nc localhost 11211
