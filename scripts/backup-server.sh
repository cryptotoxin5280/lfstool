#!/bin/bash

TARGET=$1
PASSWORD=$2

# Create the backup image of the target
sshpass -p $PASSWORD ssh smr@$TARGET "echo $PASSWORD | sudo -S tar -cvpzf backup.tar.gz --exclude=/home/smr/backup.tar.gz --one-file-system /"

# Copy the backup image from the target
sshpass -p $PASSWORD scp smr@$TARGET:~/backup.tar.gz .
