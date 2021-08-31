const {app, BrowserWindow, dialog, ipcMain} = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const SSH = require('simple-ssh');
const {Client} = require('node-scp');
const ping = require('ping');
const fs = require('fs');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 600,
    title: 'SMR Linux Filesystem Tool',
    icon: `${path.join(__dirname, '../build/smr.png')}`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.removeMenu();
  win.setMenu(null);

  win.loadURL(
    isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`
  );
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
      app.quit();
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

const genRestoreScript = () => {
  const content = `#!/bin/bash

  PASSWORD=$1
  
  # Restore the backup
  echo $PASSWORD | sudo -S tar -xvpzf /home/smr/backup.tar.gz -C / --numeric-owner
  
  # Get the UUID
  UUID=\`echo $PASSWORD | sudo -S blkid /dev/sda1 -o value | head -1\`
  
  # Update the UUID in fstab
  echo $PASSWORD | sudo -S sed -i "s/UUID=.*\\//UUID=$UUID \\//" /etc/fstab
  
  # Update the Grub config
  echo $PASSWORD | sudo -S update-grub
  
  # Re-install Grub to the MBR
  echo $PASSWORD | sudo -S grub-install /dev/sda
  
  # Re-install SSH Server
  echo $PASSWORD | sudo -S apt-get install -y openssh-server
  
  # Reboot the target
  echo $PASSWORD | sudo -S reboot
`;
  fs.writeFile('config-Server.sh', content, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

ipcMain.on('selectDirectory', (event) => {
  const options = {
    properties: [
    'openDirectory'
  ]};
  dialog.showOpenDialog(options).then((res) => {
    event.sender.send('selectDirectoryResp', res.filePaths[0]);
  }).catch((err) => {
    console.error(err);
  });
})

ipcMain.on('selectFile', (event) => {
  const options = {};
  dialog.showOpenDialog(options).then((res) => {
    event.sender.send('selectFileResp', res.filePaths[0]);
  }).catch((err) => {
    console.error(err);
  });
})

ipcMain.on('archive', (event, host, password, filename) => {
  ping.sys.probe(host, (isAlive) => {
    if (isAlive) {
      console.log(`${host} is alive!`);
    }
    else {
      console.error(`${host} is not alive!`);
      event.sender.send('restoreResp', `${host} is not online!`);
      return;
    }
  });
  try {
    const ssh = new SSH({
      host: host,
      user: 'smr',
      pass: password,
    });
    ssh.exec(`echo ${password} | \
      sudo -S tar -cvpzf backup.tar.gz \
      --exclude=/home/smr/backup.tar.gz \
      --one-file-system /`, {
      out: function (stdout) {
        // console.log(stdout);
      },
      exit: async function () {
        console.log('Remote filesytem archive complete...');
        console.log('Transferring remote archive to local device...');
        try {
          const scp = await Client({
            host: host,
            username: 'smr',
            password: password
          });
          console.log(`Saving ${filename}`);
          await scp.downloadFile('backup.tar.gz', filename);
          event.sender.send('archiveResp', 200);
          scp.close();
        } catch (err) {
          console.error(err);
          event.sender.send('archiveResp', 
            'Problem encountered downloading file: ' + err);
        }
      }
    }).start();
  } catch (err) {
    console.error(err);
    event.sender.send('archiveResp',
      'Problem encountered archiving target filesystem: ' + err);
  }
});

ipcMain.on('restore', async (event, host, password, filename) => {
  ping.sys.probe(host, (isAlive) => {
    if (isAlive) {
      console.log(`${host} is alive!`);
    }
    else {
      console.error(`${host} is not alive!`);
      event.sender.send('restoreResp', `${host} is not online!`);
      return;
    }
  });
  genRestoreScript();
  try {
    const scp = await Client({
      host: host,
      username: 'smr',
      password: password
    });
    await scp.uploadFile(filename, 'backup.tar.gz');
    await scp.uploadFile('./config-server.sh', 'config-server.sh');
    scp.close();
  } catch (err) {
    console.error(err);
    event.sender.send('restoreResp',
      `Problem encountered while transferring archive to target device: ${err}`);
  }
  try {
    const ssh = new SSH({
      host: host,
      user: 'smr',
      pass: password,
    });
    ssh.exec(`echo ${password} | \
      sudo -S nohup bash config-server.sh ${password} >/dev/null 2>&1 &`, {
      out: function (stdout) {
        // console.log(stdout);
    },
    exit: function () {
      console.log('Started remote filesystem restore...');
      let keepAlives = 0;
      const timerId = setInterval(() => {
        ping.sys.probe(host, (isAlive) => {
          if (isAlive) {
            console.log(`${host} is alive!`);
            keepAlives = keepAlives + 1;
          }
          else {
            console.log(`${host} is not alive!`);
          }
          if (keepAlives > 10) {
            clearInterval(timerId);
            console.log('Remote system is back online...');
            event.sender.send('restoreResp', 200);
          }
        });
      }, 5000);
    }
  }).start();
  } catch (err) {
  console.error(err);
  event.sender.send('restoreResp',
    'Problem encountered restoring target filesystem: ' + err);
  }
});
