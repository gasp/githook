#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- env4.sh  ----------------"
date

# front
echo "---------------- front"
cd ~/www/env4/front
git status
git pull
php private/bin/merge.php
