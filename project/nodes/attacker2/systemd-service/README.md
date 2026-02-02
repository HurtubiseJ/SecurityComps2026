# Systemd Restart Service
These systemd files are used to restart the application following config changes.

Once the repo is added to the machine you must manually configure and enabled the service

Ex:
sudo cp /attacker2/systemd-service/attacker2.path /ect/systemd/system/
sudo cp /attacker2/systemd-service/attacker2.service /ect/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enabled attacker2.path
sudo systemctl start attacker2.path
