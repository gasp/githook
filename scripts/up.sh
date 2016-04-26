#!/usr/bin/env bash

# Deploy last release
# on Bo and Front

############################################################
#settings links
linkToRootDir="$(pwd)"
linkToFrontDir=$linkToRootDir'/front'
linkToBoDir=$linkToRootDir'/bo'
if [ ! -d "$linkToFrontDir" ]; then
	echo -e "\e[91mError: Front folder doesn't exist ! (at $linkToFrontDir)\e[0m"
	exit 1;
fi
if [ ! -d "$linkToBoDir" ]; then
	echo -e "\e[91mError: Bo folder doesn't exist ! (at $linkToBoDir)\e[0m"
	exit 1;
fi

############################################################
#Front side branch version
cd $linkToFrontDir
	branchfront=`git rev-parse --abbrev-ref HEAD`
	if ! echo "$branchfront" | grep -q "release"; then
		echo -e "\e[91mError: Not a release branch, Front on $branchfront\e[0m"
		exit 1;
	fi
	
############################################################
#Bo side branch version
cd $linkToBoDir
	branchbo=`git rev-parse --abbrev-ref HEAD`
	if ! echo "$branchbo" | grep -q "release"; then
		echo -e "\e[91mError: Not a release branch, Bo on $branchbo\e[0m"
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
	echo -e "\e[7mfetch\e[27m"
	git fetch --quiet
	echo -e "\e[7mcheckout master\e[27m"
	git checkout master
	echo -e "\e[7mpull\e[27m"
	git pull
	echo -e "\e[7mtag old version\e[27m"
	git tag -a v$oldversion -m "auto tag $oldversion"
	echo -e "\e[7mpush\e[27m"
	git push origin v$oldversion
	
	########################################################
	# sync branch master-dev with master and last release deployed
	echo -e "\e[7mcheckout master-dev\e[27m"
	git checkout master-dev
	echo -e "\e[7mpull\e[27m"
	git pull
	
		# merge master back into master-dev
		echo -e "\e[7mmerge master\e[27m"
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
		echo -e "\e[7mmerge old release\e[27m"
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
	echo -e "\e[7mfetch\e[27m"
	git fetch --quiet
	echo -e "\e[7mgulp bump\e[27m"
	gulp bump;
	newversion=`node -e "console.log(require('./package.json').version);"`
	echo -e "\e[7mcheckout -b new version\e[27m"
	git checkout -b "release-$newversion"
	git add package.json
	git commit -m "bumping version to $newversion";
	echo -e "\e[7mpush\e[27m"
	git push;
	# this will do a deploy by githook
	
############################################################
# BREAKPOINT, front, new branch release created
############################################################
echo "front released"

	########################################################
	# deploy front
	echo -e "\e[7mdeploy front\e[27m"
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
	echo -e "\e[7mfetch bo\e[27m"
	git fetch --quiet
	echo -e "\e[7mcheckout master\e[27m"
	git checkout master
	echo -e "\e[7mpull\e[27m"
	git pull
	echo -e "\e[7mtag old version\e[27m"
	git tag -a v$oldversion -m "auto tag $oldversion"
	echo -e "\e[7mpush\e[27m"
	git push origin v$oldversion
	
	########################################################
	# sync branch master-dev with master and last release deployed
	echo -e "\e[7mcheckout master-dev\e[27m"
	git checkout master-dev
	echo -e "\e[7mpull\e[27m"
	git pull
	
		# merge master back into master-dev
		echo -e "\e[7mmerge master\e[27m"
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
		echo -e "\e[7mmerge old release\e[27m"
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
	echo -e "\e[7mfetch\e[27m"
	git fetch --quiet
	echo -e "\e[7mcheckout -b new release\e[27m"
	git checkout -b "release-$newversion"
	echo -e "\e[7mpush\e[27m"
	git push;
	
############################################################
# BREAKPOINT, bo, new branch release created
############################################################
echo "bo released"

	########################################################
	#Bo deploy 
	cd VideoDesk/Symfony/
	echo -e "\e[7mdeploy bo\e[27m"
	bin/deploy_dev.sh
	
############################################################
# BREAKPOINT, bo, new branch release deployed
############################################################
echo "bo deployed"

############################################################
# BREAKPOINT, (bo and front) new release ready !
############################################################
echo -e "\e[32mALL DONE !\e[0m"
