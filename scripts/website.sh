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
    echo vdk website deploy script
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

# website deploy script
echo "---------------- website"
echo $path
cd $path
git status
git pull
