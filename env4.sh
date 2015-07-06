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

#cache
echo "---------------- cache"
cd ~/www/env4/cache
git status
git pull

#website
echo "---------------- website"
cd ~/www/env4/website
git status
git pull