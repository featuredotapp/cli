URL=https://github.com/mailscript/cli/archive/main.zip
tmp=/tmp
rm -r ./docs/cli
wget $URL -O $tmp/main-cli.zip
unzip  $tmp/main-cli.zip 'cli-main/docs/*' -d /tmp/
mv /tmp/cli-main/docs/ docs/cli