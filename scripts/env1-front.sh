#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- env3.sh  ----------------"
date

# front
echo "---------------- front"
cd ~/www/env1/front
git status
git pull
php private/bin/merge.php
