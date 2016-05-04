#!/usr/bin/env bash

# Deploy release n+1
# on Bo and Front

############################################################
# check location, script work with env next
if [ ! -d "/home/videodesk/www/envnext/" ]; then
    echo -e "\e[91mHum.... /home/videodesk/www/envnext/ not found !\e[0m";
    exit 1;
fi

cd /home/videodesk/www/envnext

############################################################
# setting links
linkToRootDir="$(pwd)"
linkToFrontDir=$linkToRootDir'/front'
linkToBoDir=$linkToRootDir'/bo'

############################################################
# pre-check if environment looks fine

# check that folders exist
if [ ! -d "$linkToFrontDir" ]; then
	echo -e "\e[91mError: Front folder doesn't exist ! (at $linkToFrontDir)\e[0m"
	exit 1;
fi
if [ ! -d "$linkToBoDir" ]; then
	echo -e "\e[91mError: Bo folder doesn't exist ! (at $linkToBoDir)\e[0m"
	exit 1;
fi

# check that environment is running release branches
cd $linkToFrontDir
branchfront=`git rev-parse --abbrev-ref HEAD`
if ! echo "$branchfront" | grep -q "release"; then
	echo -e "\e[91mError: Not a release branch, Front on $branchfront\e[0m"
	exit 1;
fi
cd $linkToBoDir
branchbo=`git rev-parse --abbrev-ref HEAD`
if ! echo "$branchbo" | grep -q "release"; then
	echo -e "\e[91mError: Not a release branch, Bo on $branchbo\e[0m"
	exit 1;
fi

# check that package.json and git release branch versions match
cd $linkToFrontDir
currentFrontGitVersion=${branchfront##*-}
currentFrontPackageVersion=`node -e "console.log(require('./package.json').version);"`
if [ ! "$currentFrontPackageVersion" = "$currentFrontGitVersion" ]; then
	echo -e "\e[91mRelease branch does not match with front package.json version\e[0m";
	echo -e "\e[91m > release: $currentFrontGitVersion\e[0m";
	echo -e "\e[91m > package.json version: $currentFrontPackageVersion\e[0m";
	exit 1; # throw an error code
fi

# check that branches are aligned
if [ "$branchbo" = "$branchfront" ]
then
	echo -e " > environnment is currently running \e[7m $branchbo \e[27m";
else
	echo -e "\e[91mRelease branch does not match\e[0m";
	echo -e "\e[91m > Bo: $branchbo\e[0m";
	echo -e "\e[91m > Front: $branchfront\e[0m";
	exit 1; # throw an error code
fi

############################################################
#Get release version id
currentversion=${branchbo##*-}

############################################################
#Last release version ?
echo -n 'is it the last release version ? (press y [like Yes] to continue, other key will quit): '
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
	echo -e "\e[7m git fetch\e[27m"
	git fetch --quiet
	echo -e "\e[7m git checkout master\e[27m"
	git checkout master
	echo -e "\e[7m git pull origin master\e[27m"
	git pull origin master
	echo -e "\e[7m git tag old version\e[27m"
	git tag -a v$currentversion -m "auto tag $currentversion"
	echo -e "\e[7m git push tag\e[27m"
	git push origin v$currentversion

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
			echo  -e "\e[91mConflicts ! (front, master-dev with master)\e[0m"
			exit 1;
		fi

		# merge lasrt release deployed into master-dev
		echo -e "\e[7mmerge old release\e[27m"
		git merge --no-ff --no-edit release-$currentversion
			# in case of strange things, also gather the old branch,
			# to avoid loosing commits on the wrong branch
			# yes, this is a serge-specific feature

		# check unmerged files (if conflicts)
		hasConflict="$(git ls-files -u)"
		if [ ! "$hasConflict" = "" ]; then
			echo -e "\e[91mConflicts ! (front, master-dev with last release)\e[0m"
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
	nextversion=`node -e "console.log(require('./package.json').version);"`
	echo -e "\e[7mcheckout -b new version\e[27m"
	git checkout -b "release-$nextversion"
	git add package.json
	git commit -m "bumping version to $nextversion";
	echo -e "\e[7mpush\e[27m"
	git push origin "release-$nextversion";
	# this will do a deploy by githook

############################################################
# BREAKPOINT, front, new branch release created
############################################################
echo -e "\e[42mfront released\e[0m"

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
	git tag -a v$currentversion -m "auto tag $currentversion"
	echo -e "\e[7mpush\e[27m"
	git push origin v$currentversion

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
			echo -e "\e[91mConflicts ! (front, master-dev with master)\e[0m";
			exit 1;
		fi

		# merge lasrt release deployed into master-dev
		echo -e "\e[7mmerge old release\e[27m"
		git merge --no-ff --no-edit release-$currentversion
			# in case of strange things, also gather the old branch,
			# to avoid loosing commits on the wrong branch
			# yes, this is a serge-specific feature

		# check unmerged files (if conflicts)
		hasConflict="$(git ls-files -u)"
		if [ ! "$hasConflict" = "" ]; then
			echo -e "\e[91mConflicts ! (front, master-dev with last release)\e[0m";
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
	git checkout -b "release-$nextversion"
	echo -e "\e[7mpush\e[27m"
	git push origin "release-$nextversion";

############################################################
# BREAKPOINT, bo, new branch release created
############################################################
echo -e "\e[42mbo released\e[0m"


############################################################
# Deployment

# A break to read git response before deployment :)
echo " > ready to deploy release-$nextversion on front and bo";
echo -n 'Start deployment ? (press y [like Yes] to continue, other key will quit): '
read keykey
echo $keykey
if [ ! "$keykey" = "y" ]; then
	echo 'Bye'
	exit 1;
fi

# deploy bo
cd $linkToBoDir
cd VideoDesk/Symfony/
echo -e "\e[7mdeploy bo\e[27m"
bin/deploy_dev.sh
echo -e "\e[42mbo deployed\e[0m"
app/console videodesk:version:upgrade --release
git commit -m "up release version to $nextversion";
git push origin "release-$nextversion";
echo -e "\e[42mUp version project\e[0m"

# deploy front
cd $linkToFrontDir
echo -e "\e[7mdeploy front\e[27m"
./deploy.sh
echo -e "\e[42mfront deployed\e[0m";

# (bo and front) new release ready !
echo " > bo is now running release-$nextversion";
echo " > front is now running release-$nextversion";
echo -e "\e[32mALL DONE !\e[0m"
date +%Y-%m-%d:%H:%M:%S
