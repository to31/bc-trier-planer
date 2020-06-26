cd /home/deploy/verband
echo "Pulling from Stable"

sudo git reset --hard
echo "Git reset"

sudo git pull origin master
echo "Pulled successfully from master"

sudo service verband restart
echo "Server restarted successfully"

chmod +x deploy.sh