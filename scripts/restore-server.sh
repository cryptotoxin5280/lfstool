#!/bin/bash

TARGET=$1
PASSWORD=$2

# Copy the backup image to the target
sshpass -p $PASSWORD scp backup.tar.gz smr@$TARGET:~/.

# Copy the config script to the target
sshpass -p $PASSWORD scp config-server.sh smr@$TARGET:~/.

# Execute the config script
sshpass -p $PASSWORD ssh smr@$TARGET "echo $PASSWORD | sudo -S ./config-server.sh $PASSWORD"
