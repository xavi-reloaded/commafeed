export WEBAPPS_PATH="/home/sidev/workspace/apps/apache-tomee/webapps"
rm $WEBAPPS_PATH/youkeyword -fr
rm $WEBAPPS_PATH/youkeyword.war
cp ../target/youkeyword.war $WEBAPPS_PATH/.

