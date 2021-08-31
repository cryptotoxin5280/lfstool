import React, {useState} from 'react';
import {Redirect, withRouter} from 'react-router'
import {Route, Switch} from 'react-router-dom';
import MainView from './MainView';
import BackupView from './BackupView';
import RestoreView from './RestoreView';
import { faSmileWink } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [isMainViewVisible, setIsMainViewVisible] = useState(true);
  const [isBackupViewVisible, setIsBackupViewVisible] = useState(false);
  const [isRestoreViewVisible, setIsRestoreViewVisible] = useState(false);

  return (
    <div className='bg-dark' style={{height: '100vh'}}>
      {isMainViewVisible 
        ? <MainView 
            setIsMainViewVisible={setIsMainViewVisible}
            setIsBackupViewVisible={setIsBackupViewVisible}
            setIsRestoreViewVisible={setIsRestoreViewVisible}
          />
        : null }
      {isBackupViewVisible 
        ? <BackupView
            setIsMainViewVisible={setIsMainViewVisible}
            setIsBackupViewVisible={setIsBackupViewVisible}
          />
        : null}
      {isRestoreViewVisible 
        ? <RestoreView
            setIsMainViewVisible={setIsMainViewVisible}
            setIsRestoreViewVisible={setIsRestoreViewVisible}
          />
        : null}
    </div>
  );
}

export default withRouter(App);
