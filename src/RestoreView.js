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
//import InProgressModal from './InProgressModal';
const {ipcRenderer} = window.require('electron');

const RestoreView = (props) => {
  const [password, setPassword] = useState('');
  const [host, setHost] = useState('192.168.1.50');
  const [fileName, setFileName] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleCancelBtn = () => {
    props.setIsRestoreViewVisible(false);
    props.setIsMainViewVisible(true);
  }

  const selectFile = () => {
    ipcRenderer.send('selectFile');
  }

  const restoreRemoteFilesystem = () => {
    ipcRenderer.send('restore', host, password, fileName);
    setShowModal(true);
  };

  useEffect(() => {
    ipcRenderer.on('restoreResp', (event, msg) => {
      if (msg === 200) {
        setShowModal(false);
        handleCancelBtn();
      }
      else {
        setShowModal(false);
        alert('Restore stdout: ' + msg);
      }
    });
    ipcRenderer.on('selectFileResp', (event, fileName) => {
      setFileName(fileName);
    });
  }, []);

  return (
    <div className='h-100 d-flex justify-content-center'>
      <Card className='my-auto' style={{width: '25rem'}}>
        <Card.Header>
          <b>Restore Target Filesystem</b>
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
          <Form.Label>Select Filesystem Archive</Form.Label>
          <InputGroup>
            <FormControl
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
            /> 
            <FontAwesomeIcon
                className='my-auto mx-2'
                icon={faFolderOpen}
                size='lg'
                color='orange'
                onClick = {selectFile}
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
            className='btn-danger'
            onClick={(event) => restoreRemoteFilesystem()}
          >
            Restore Filesystem
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
            Restoring remote filesystem...
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please do not interrupt the restore process as it could brick the target device!
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RestoreView;
