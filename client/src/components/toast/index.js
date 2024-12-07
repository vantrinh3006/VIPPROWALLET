import React from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

function IsComingToast() {
  return (
    <ToastContainer
      position="top-end"
      className="p-3"
      style={{ zIndex: 99999 }}
    >
      <Toast bg="info" >
        <Toast.Header>
          <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
          <strong className="me-auto" style={{ fontWeight: 900 }}>Notification</strong>
          <small className="text-muted" style={{ fontWeight: 600 }}>2 seconds ago</small>
        </Toast.Header>
        <Toast.Body>This method is coming soon</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default IsComingToast;
