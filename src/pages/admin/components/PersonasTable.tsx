import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import * as React from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';

import Persona from "../../../types/persona";
import DataLayer from '../../../services/personaService';

const DeletePersonaModal = React.lazy(() => import('./DeletePersonaModal'));
const SavePersonaModal = React.lazy(() => import('./SavePersonaModal'));

type PersonasTableProps = {
  personas: Persona[];
};

const emptyPersona: Persona = {
  id: 0,
  nombre: '',
  apellido: '',
  email: '',
  telefono: 0,
  rolUsuario: '' 
};

const PersonasTable: React.FC<PersonasTableProps> = ({ personas }) => {
  // State
  const [error, setError] = React.useState<any>(null);
  const [listedPersonas, setListedPersonas] = React.useState<Persona[]>(personas);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedPersona, setSelectedPersona] = React.useState<Persona | null>(null);
  const [showDeleteModal, setShowDeleteModal] = React.useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = React.useState<boolean>(false);

  // Handlers
  const onCloseDeleteModal = React.useCallback(() => setShowDeleteModal(false), [setShowDeleteModal]);
  const onCloseSaveModal = React.useCallback(() => setShowSaveModal(false), [setShowSaveModal]);
  const onDelete = React.useCallback(() => {
    if (selectedPersona) {
      setShowDeleteModal(false);
      setLoading(true);
      DataLayer.delete.persona(selectedPersona.id!)
        .then(() => setListedPersonas((prevState: Persona[]) => prevState.filter((item: Persona) => item.id !== selectedPersona.id)))
        .catch((error: any) => setError(error))
        .finally(() => setLoading(false));
    }
  }, [selectedPersona, setShowDeleteModal, setListedPersonas, setLoading]);
  const onSave = React.useCallback((p: Persona) => {
    if (selectedPersona) {
      setShowSaveModal(false);
      setLoading(true);
      if (p.id) {
        DataLayer.update.persona(p)
          .then((editedPersona: Persona) => setListedPersonas((prevState: Persona[]) => prevState.map((item: Persona) => item.id === editedPersona.id ? editedPersona : item)))
          .catch((error: any) => setError(error))
          .finally(() => setLoading(false));
      } else {
        // Delete id property since it is a create action
        delete p.id;

        DataLayer.create.persona(p)
          .then((createdPersona: Persona) => {
            setListedPersonas((prevState: Persona[]) => [...prevState, createdPersona]);
          })
          .catch((error: any) => setError(error))
          .finally(() => setLoading(false));
      }
    }
  }, [selectedPersona, setShowSaveModal, setListedPersonas, setLoading]);
  const onShowDeleteModal = React.useCallback((p: Persona) => {
    setSelectedPersona(p);
    setShowDeleteModal(true);
  }, [setSelectedPersona, setShowDeleteModal]);
  const onShowSaveModal = React.useCallback((p?: Persona) => {
    setSelectedPersona(p ?? emptyPersona);
    setShowSaveModal(true);
  }, [setSelectedPersona, setShowSaveModal])

  // Render
  if (error) {
    return (
      <Alert variant="danger">
        {error?.message || 'Something went wrong while fetching clients.'}
      </Alert>
    );
  }

  return (
    <React.Suspense fallback={<Spinner animation="border" />}>
      {
        loading
          ? (
            <div style={{ alignItems: 'center', display: 'flex', height: '100vh', justifyContent: 'center', width: '100wh' }}>
              <Spinner animation="border" />
            </div>
          )
          : (
            <>
              <Button onClick={() => onShowSaveModal()} style={{ float: 'left',  marginTop: '70px', marginBottom: '10px' }} variant="primary">Crear Cliente</Button>
              <Table striped bordered hover className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Telefono</th>
                    <th>E-mail</th>
                    <th>Rol</th> 
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    listedPersonas.map((p: Persona) => (
                      <tr key={p.id}>
                        <td width='2%'>{p.id}</td>
                        <td width='23%'>{p.nombre}</td>
                        <td width='45%'>{p.apellido}</td>
                        <td width='10%'>{p.telefono}</td>
                        <td width='5%'>{p.email}</td>
                        <td width='10%'>{p.rolUsuario}</td> {/* Nova célula para mostrar o rol */}
                        <td width='10%'>
                          <Button onClick={() => onShowSaveModal(p)} variant="link" className="table-btn-editar">Editar</Button>
                          <Button onClick={() => onShowDeleteModal(p)} variant="link" className="table-btn-eliminar">Eliminar</Button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </Table>
            </>
          )
      }
      <DeletePersonaModal
        onDelete={onDelete}
        onHide={onCloseDeleteModal}
        persona={selectedPersona}
        show={showDeleteModal}
      />
      <SavePersonaModal
        onHide={onCloseSaveModal}
        onSave={onSave}
        persona={selectedPersona}
        show={showSaveModal}
      />
    </React.Suspense>
  );
};

export default PersonasTable