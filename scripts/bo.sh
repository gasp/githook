#!/usr/bin/env bash

echo "---------------- new hook ----------------"
date

# A POSIX variable
OPTIND=1         # Reset in case getopts has been used previously in the shell.

# Initialize our own variables:
verbose=0
path=''

while getopts "h?vf:" opt; do
  case "$opt" in
  h|\?)
    echo BO deploy script
    echo usage:
    echo   bo.sh [-v] path
    echo   -v verbosity
    exit 0
    ;;
  v)  verbose=1
    ;;
  esac
done

shift $((OPTIND-1))

[ "$1" = "--" ] && shift
path=$@
echo "verbose=$verbose, output_file='$output_file', Leftovers: $@"

# bo deploy script
echo "---------------- bo"
echo $path
cd $path
git pull
git status
cd VideoDesk/Symfony
sh bin/deploy_dev.sh
php app/console cache:clear --env=dev --no-debug;
php app/console cache:clear --env=prod --no-debug;
php app/console assetic:dump --env=prod --no-debug;
php app/console assets:install web
