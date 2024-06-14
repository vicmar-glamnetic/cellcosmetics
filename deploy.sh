mkdir temp

# Download templates from store
mkdir temp/live
npm exec -- shopify theme pull --path="./temp/live" --only="templates/.*\.json" --theme=$THEME

# Set to commit of previous deploy to capture all changes since last deploy
DEPLOY_TAG="${CI_JOB_NAME}_last_deploy"
BASE_COMMIT=$(git rev-list -n 1 $DEPLOY_TAG)
echo "Using $BASE_COMMIT as base commit..."

SRC_DIR=./src/templates
OLD_DIR=./temp/old
LIVE_DIR=./temp/live/templates

# Get versions of templates from last operation
if [[ ! -z BASE_COMMIT ]]
then
    mkdir $OLD_DIR
    SRC_TEMPLATES=$SRC_DIR/*.json
    for T in $SRC_TEMPLATES
    do
        FILENAME=$(basename $T)
        if git show $BASE_COMMIT:$T > $OLD_DIR/tempfile
        then mv $OLD_DIR/tempfile $OLD_DIR/$FILENAME
        else rm $OLD_DIR/tempfile
        fi
    done
else
    echo "No previous deploy found..."
fi

# Merge files
for T in $SRC_TEMPLATES
do
    FILENAME=$(basename $T)
    SRC_FILE=$SRC_DIR/$FILENAME
    OLD_FILE=$OLD_DIR/$FILENAME
    LIVE_FILE=$LIVE_DIR/$FILENAME
    if [[ -f $SRC_FILE ]] && [[ -f $OLD_FILE ]] && [[ -f $LIVE_FILE ]]
    then
        echo "Merging $LIVE_FILE, $OLD_FILE, and $SRC_FILE..."
        if $(npm bin)/json-template-merge $LIVE_FILE $OLD_FILE $SRC_FILE
        then :
        else exit 1
        fi
    else
        cp $T $LIVE_DIR/$FILENAME
    fi
done

# Delete files that are in history but not in src
LIVE_TEMPLATES=$LIVE_DIR/*
for T in $LIVE_TEMPLATES
do
    FILENAME=$(basename $T)
    SRC_FILE=$SRC_DIR/$FILENAME
    OLD_FILE=$OLD_DIR/$FILENAME
    LIVE_FILE=$LIVE_DIR/$FILENAME
    if git show $BASE_COMMIT:$SRC_FILE && [[ ! -f $SRC_FILE ]]
    then
        echo "Deleting $T..."
        rm $T
    fi
done

DIST_DIR=./dist/templates
for T in $LIVE_TEMPLATES
do
    FILENAME=$(basename $T)
    mv -f $T $DIST_DIR/$FILENAME
done

npm exec -- shopify theme push --path="./dist" --allow-live --theme=$THEME --ignore config/settings_data.json --ignore "templates/*.json"

git config --global user.email "vstanislav87@gmail.com"  
git config --global user.name "vstanislav87"

git tag -f -a $DEPLOY_TAG -m "$CI_COMMIT_MESSAGE"
git push -f "https://vstanislav87:${ACCESS_TOKEN}@${CI_SERVER_HOST}/${CI_PROJECT_PATH}.git" --tags