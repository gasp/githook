#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- env9.sh  ----------------"
date

# bo
echo "---------------- bo"
cd ~/www/envdevrow/bo
git pull
git status
cd VideoDesk/Symfony
sh bin/deploy_dev.sh
#php app/console cache:clear --env=dev --no-debug;
#php app/console cache:clear --env=prod --no-debug;
#php app/console assetic:dump --env=prod --no-debug;
#php app/console assets:install web
echo 'flush_all' | nc localhost 11211
