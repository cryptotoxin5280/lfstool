#!/bin/bash

PASSWORD=$1

# Restore the backup
echo $PASSWORD | sudo -S tar -xvpzf /home/smr/backup.tar.gz -C / --numeric-owner

# Get the UUID
UUID=`echo $PASSWORD | sudo -S blkid /dev/sda1 -o value | head -1`

# Update the UUID in fstab
echo $PASSWORD | sudo -S sed -i "s/UUID=.*\//UUID=$UUID \//" /etc/fstab

# Update the Grub config
echo $PASSWORD | sudo -S update-grub

# Re-install Grub to the MBR
echo $PASSWORD | sudo -S grub-install /dev/sda

# Re-install SSH Server
echo $PASSWORD | sudo -S apt-get install -y openssh-server

# Reboot the target
echo $PASSWORD | sudo -S reboot
