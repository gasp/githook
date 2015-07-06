#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- env4.sh  ----------------"
date

# bo
echo "---------------- bo"
cd ~/www/env4/bo
git pull
git status
cd VideoDesk/Symfony
php app/console cache:clear --env=dev --no-debug;
php app/console cache:clear --env=prod --no-debug;
php app/console assetic:dump --env=prod --no-debug;
php app/console assets:install web
