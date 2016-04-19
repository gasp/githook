#!/usr/bin/env bash

# Deploy last release
# on Bo and Front

############################################################
#settings links
linkToRootDir="$(pwd)"
linkToFrontDir=$linkToRootDir'/front'
linkToBoDir=$linkToRootDir'/bo'
if [ ! -d "$linkToFrontDir" ]; then
	echo "Error: Front folder doesn't exist ! (at $linkToFrontDir)"
	exit 1;
fi
if [ ! -d "$linkToBoDir" ]; then
	echo "Error: Bo folder doesn't exist ! (at $linkToBoDir)"
	exit 1;
fi

############################################################
#Front side branch version
cd $linkToFrontDir
	branchfront=`git rev-parse --abbrev-ref HEAD`
	if ! echo "$branchfront" | grep -q "release"; then
		echo "Error: Not a release branch, Front on $branchfront"
		exit 1;
	fi
	
############################################################
#Bo side branch version
cd $linkToBoDir
	branchbo=`git rev-parse --abbrev-ref HEAD`
	if ! echo "$branchbo" | grep -q "release"; then
		echo "Error: Not a release branch, Bo on $branchbo"
		exit 1;
	fi

############################################################
#Validation release version
if [ "$branchbo" = "$branchfront" ]
then
    echo " > Currently [$branchbo]";
else
    echo 'Release branch does not match';
    echo " > Bo: $branchbo";
    echo " > Front: $branchfront";
    exit 1; # throw an error code
fi

############################################################
#Get release version id
oldversion=${branchbo##*-}

############################################################
#Last release version ?
echo -n 'This is the last release version ? (press y [like Yes] to continue, other key will quit): '
read key
echo $key
if [ ! "$key" = "y" ]; then
	echo 'Bye'
	exit 1;
fi

############################################################
# BREAKPOINT, we have bo and front release-branches
############################################################


############################################################
#Front side 
cd $linkToFrontDir
	########################################################
	#Backup
	git fetch --quiet
	git checkout master
	git pull
	git tag -a v$oldversion -m "auto tag $oldversion"
	git push origin v$oldversion
	
	########################################################
	# sync branch master-dev with master and last release deployed
	git checkout master-dev
	git pull
	
		# merge master back into master-dev
		git merge --no-ff --no-edit master
			# --no-ff create a merge commit even when the merge resolves as a fast-forward
			# --no-edit accept the auto-generated message
			
		# check unmerged files (if conflicts)
		hasConflict="$(git ls-files -u)"
		if [ ! "$hasConflict" = "" ]; then
			echo 'Conflicts ! (front, master-dev with master)'
			exit 1;
		fi
		
		# merge lasrt release deployed into master-dev
		git merge --no-ff --no-edit release-$oldversion
			# in case of strange things, also gather the old branch,
			# to avoid loosing commits on the wrong branch
			# yes, this is a serge-specific feature
			
		# check unmerged files (if conflicts)
		hasConflict="$(git ls-files -u)"
		if [ ! "$hasConflict" = "" ]; then
			echo 'Conflicts ! (front, master-dev with last release)'
			exit 1;
		fi
		
	########################################################
	# BREAKPOINT, front, branch master-dev is up-to-date 
	########################################################

	########################################################
	# create new release-1.8.xx from master-dev
	git fetch --quiet
	gulp bump;
	newversion=`node -e "console.log(require('./package.json').version);"`
	git checkout -b "release-$newversion"
	git add package.json
	git commit -m "bumping version to $newversion";
	git push;
	# this will do a deploy by githook
	
############################################################
# BREAKPOINT, front, new branch release created
############################################################
echo "front released"

	########################################################
	# deploy front
	./deploy.sh

############################################################
# BREAKPOINT, front, new branch release deployed
############################################################
echo "front deployed"


############################################################
#Bo side 
cd $linkToBoDir

	########################################################
	#Backup
	git fetch --quiet
	git checkout master
	git pull
	git tag -a v$oldversion -m "auto tag $oldversion"
	git push origin v$oldversion
	
	########################################################
	# sync branch master-dev with master and last release deployed
	git checkout master-dev
	git pull
	
		# merge master back into master-dev
		git merge --no-ff --no-edit master
			# --no-ff create a merge commit even when the merge resolves as a fast-forward
			# --no-edit accept the auto-generated message
			
		# check unmerged files (if conflicts)
		hasConflict="$(git ls-files -u)"
		if [ ! "$hasConflict" = "" ]; then
			echo 'Conflicts ! (front, master-dev with master)'
			exit 1;
		fi
		
		# merge lasrt release deployed into master-dev
		git merge --no-ff --no-edit release-$oldversion
			# in case of strange things, also gather the old branch,
			# to avoid loosing commits on the wrong branch
			# yes, this is a serge-specific feature
			
		# check unmerged files (if conflicts)
		hasConflict="$(git ls-files -u)"
		if [ ! "$hasConflict" = "" ]; then
			echo 'Conflicts ! (front, master-dev with last release)'
			exit 1;
		fi
		
	############################################################
	# BREAKPOINT, bo, branch master-dev is up-to-date 
	############################################################
	
	########################################################
	## create new release-1.8.xx from master-dev
	git fetch --quiet
	git checkout -b "release-$newversion"
	git push;
	
############################################################
# BREAKPOINT, bo, new branch release created
############################################################
echo "bo released"

	########################################################
	#Bo deploy 
	cd VideoDesk/Symfony/
	bin/deploy_dev.sh
	
############################################################
# BREAKPOINT, bo, new branch release deployed
############################################################
echo "bo deployed"

############################################################
# BREAKPOINT, (bo and front) new release ready !
############################################################
echo "ALL DONE !"
