import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ContactForm from '../ContactForm/ContactForm';
import './Homepage.css';

function Homepage() {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [selectedContact, setSelectedContact] = useState({});
  const [contacts, setContacts] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);

  const openModal = () => {
    setOpenAddModal(true);
  };
  const closeModal = () => {
    setOpenAddModal(false);
    setOpenEditModal(false);
    // getData();
  };

  const cancelAddModal = () => {
    setOpenAddModal(false);
  };
  const editContact = (contact) => {
    console.log("contact", contact);
    setSelectedContact(contact);
    setOpenEditModal(true);
  };

  const deleteSelectedContact = (id)=> {
    window.electronAPI.delContract(id);
    closeModal();
  }
  const cancelEditModal = () => {
    setOpenEditModal(false);
  };

  useEffect(()=>{
    if (firstLoad){
      window.electronAPI.readContract();
    }
  },[firstLoad])

  useEffect(()=> {
    window.electronAPI.listContract( (event, data) => {
      // console.log('ssl',data);
      setContacts(data);
    });
  }, [])

  useEffect(()=> {
    window.electronAPI.appendContract( (event, data) => {
      setContacts((contacts) => [...contacts, data]);
    });
  },[])
  
  return (
    <div className="home-page" style={{ padding: '20px' }}>
      <h1>Contacts</h1>
      <Modal show={openAddModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ContactForm
            edit={false}
            onSave={closeModal.bind(this)}
            onCancelAdd={cancelAddModal}
            closeModal={closeModal}
          />
        </Modal.Body>
      </Modal>
      <Modal show={openEditModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ContactForm
            edit
            onSave={closeModal.bind(this)}
            contact={selectedContact}
            onCancelEdit={cancelEditModal}
            closeModal={closeModal}
          />
        </Modal.Body>
      </Modal>
      <ButtonToolbar>
        <Button variant="outline-primary" onClick={openModal}>
          Add Contact
        </Button>
        {/* <Button variant="outline-primary" onClick={refresh}>
          Refresh
        </Button> */}
      </ButtonToolbar>
      <br />
      <div className="table-responsive" style={{ width: '95vw' }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Address</th>
              <th>City</th>
              <th>Country</th>
              <th>Postal Code</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Age</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => {
              return(
              <tr key={c.id}>
                <td>{c.firstName}</td>
                <td>{c.lastName}</td>
                <td>{c.address}</td>
                <td>{c.city}</td>
                <td>{c.country}</td>
                <td>{c.postalCode}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>{c.age}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    onClick={()=>editContact(c)}
                  >
                    Edit
                  </Button>
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    onClick={()=>deleteSelectedContact(c.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>)
})}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
export default Homepage;