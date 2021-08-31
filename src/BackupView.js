import React, {useEffect, useState} from 'react';
import {
  Button,
  Card,
  Form,
  FormControl,
  InputGroup,
  Modal} from 'react-bootstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFolderOpen, faSync} from '@fortawesome/free-solid-svg-icons';
const {ipcRenderer} = window.require('electron');

const BackupView = (props) => {
  const [password, setPassword] = useState('');
  const [host, setHost] = useState('192.168.1.50');
  const [directory, setDirectory] = useState('');
  const [fileName, setFileName] = useState('backup.tar.gz');
  const [showModal, setShowModal] = useState(false);

  const archiveRemoteFilesystem = () => {
    ipcRenderer.send('archive', host, password, directory + "\\" + fileName);
    setShowModal(true);
  };

  const handleCancelBtn = () => {
    props.setIsBackupViewVisible(false);
    props.setIsMainViewVisible(true);
  };

  const selectDirectory = () => {
    ipcRenderer.send('selectDirectory');
  }

  useEffect(() => {
    ipcRenderer.on('archiveResp', (event, msg) => {
      if (msg === 200) {
        setShowModal(false);
        handleCancelBtn();
      }
    });
    ipcRenderer.on('selectDirectoryResp', (event, directory) => {
      setDirectory(directory);
    });
  }, []);

  return (
    <div className='h-100 d-flex'>
      <Card className='my-auto mx-auto' style={{width: '25rem'}}>
        <Card.Header>
          <b>Archive Target Filesystem</b>
        </Card.Header>
        <Card.Body>
          <Form.Label>Target IP Address</Form.Label>
          <InputGroup>
            <FormControl
              value={host}
              onChange={(event) => setHost(event.target.value)}
            />
          </InputGroup>
          <br/>
          <Form.Label>Password</Form.Label>
          <InputGroup>
            <FormControl
              type='password'
              onChange={(event) => setPassword(event.target.value)}
            />
          </InputGroup>
          <br/>
          <Form.Label>Output Directory</Form.Label>
          <InputGroup>
            <FormControl
              value={directory}
              onChange={(event) => setDirectory(event.target.value)}
            />
            <FontAwesomeIcon
              className='my-auto mx-2'
              icon={faFolderOpen}
              size='lg'
              color='orange'
              onClick = {selectDirectory}
          />
          </InputGroup>
          <br />
          <Form.Label>Filename</Form.Label>
          <InputGroup>
            <FormControl
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
            />
          </InputGroup>
        </Card.Body>
        <Card.Footer>
          <Button
            type='button'
            className='btn btn-secondary mx-1'
            onClick={handleCancelBtn}
          >
            Cancel
          </Button>
          <Button
            type='button'
            className='btn'
            onClick={(event) => archiveRemoteFilesystem()}
          >
            Archive Filesystem
          </Button>
        </Card.Footer>
      </Card>
      <Modal show={showModal}>
        <Modal.Header>
          <Modal.Title>
            <FontAwesomeIcon
                className='mx-4 fa-spin'
                icon={faSync}
                size='lg'
                color='blue'
            />
            Archiving remote filesystem...
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This process may take awhile...
          The archive file will be saved to the location you specified!
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BackupView;
