#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- env4.sh  ----------------"
date

#website
echo "---------------- website"
cd ~/www/env4/website
git status
git pull
