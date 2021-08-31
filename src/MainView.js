import React, {useState} from 'react';
import {Card} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faFileArchive,
  faWindowRestore
} from '@fortawesome/free-solid-svg-icons';

const MainView = (props) => {
  const handelButtonClick = (buttonName) => {
    if (buttonName === 'backup') {
      props.setIsMainViewVisible(false);
      props.setIsBackupViewVisible(true);
    } else if (buttonName === 'restore') {
      props.setIsMainViewVisible(false);
      props.setIsRestoreViewVisible(true);
    }
  }

  return (
    <div 
      className={' h-100 d-flex justify-content-center'}
    >
      <Card
        className='bg-secondary my-auto mx-3 justify-content-center align-items-center'
        style={{width: '40%', height: '75%'}}
        onClick={() => handelButtonClick('backup')}
      >
        <FontAwesomeIcon
          icon={faFileArchive}
          size='lg'
        />
        <h2>Backup Filesystem</h2>
      </Card>
      <Card
        className='bg-warning my-auto mx-3 justify-content-center align-items-center'
        style={{width: '40%', height: '75%'}}
        onClick={() => handelButtonClick('restore')}
      >
        <FontAwesomeIcon
          icon={faWindowRestore}
          size='lg'
        />
        <h2>Restore Filesystem</h2>
      </Card>
    </div>
  );
};

export default MainView;
