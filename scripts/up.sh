#!/usr/bin/env bash
echo "let's bump up minor version";
#cd ~/www/envnext/

cd front/
oldversion=`node -e "console.log(require('./package.json').version);"`
echo $oldversion


#check from front/git status
cd bo/
branchbo=`git status | grep "On branch"`
cd ..

#check from bo/git status

cd front/
branchfront=`git status | grep "On branch"`
cd ..

if [ "$branchbo" = "$branchfront" ]
then
    echo "Currently $branchbo";
else
    echo 'branch does not match';
    echo "bo: $branchbo";
    echo "front: $branchfront";
    exit 1; # throw an error code
fi

# TODO
#! check that all branches are aligned


## merge stuffs

cd front/
git fetch --quiet
git checkout master
git tag -a v$oldversion -m "auto tag $oldversion"
git push origin v$oldversion
git checkout master-dev
git pull

# merge master back into master-dev
# --no-ff create a merge commit even when the merge resolves as a fast-forward
# --no-edit accept the auto-generated message
git merge --no-ff --no-edit master

# in case of strange things, also gather the old branch,
# to avoid loosing commits on the wrong branch
# yes, this is a serge-specific feature
git merge --no-ff --no-edit release-$oldversion

# TODO
#! if any conflict, stop the mess

exit 0


## create new release-1.8.xx from master-dev
cd front/
git fetch --quiet
gulp bump; # fixed by #1893
newversion=`node -e "console.log(require('./package.json').version);"`
git checkout -b "release-$newversion"
git add package.json
git commit -m "bumping version to $newversion";
git push;
# this will do a deploy by githook
cd ..

# cd bo/
# git fetch --quiet
# git checkout release-1.8.xx
# cd Videodesk/Symfont/
# bin/deploy_dev.sh
# cd ../../../

