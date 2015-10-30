#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- env3.sh  ----------------"
date

#website
echo "---------------- website"
cd ~/www/env3/website
git status
git pull
