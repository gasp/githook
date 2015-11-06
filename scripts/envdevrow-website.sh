#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- env9.sh  ----------------"
date

#website
echo "---------------- website"
cd ~/www/envdevrow/website
git status
git pull
