#!/usr/bin/env bash

echo "---------------- new hook ----------------"
echo "---------------- translations.sh  ----------------"
date

# there should be a loop through environments there :-)

#bo translation
echo "---------------- bo9 - translation"
cd ~/www/env4/bo/VideoDesk//Symfony/vendor/bundles/Videodesk/Bundle/TranslationBundle/
/usr/bin/git pull origin master

# bo translation module
echo "---------------- bo9 - translation module"
cd ~/www/env4/bo/VideoDesk/Symfony/vendor/bundles/Videodesk/Bundle/TranslationModuleBundle/
/usr/bin/git pull origin master

# clear cache
cd ~/www/env4/bo/VideoDesk/Symfony/
php app/console cache:clear --env=dev --no-debug;
