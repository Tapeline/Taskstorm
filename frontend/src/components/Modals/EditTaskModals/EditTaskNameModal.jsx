import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {newWorkspace} from "../../../api/endpoints-workspaces.jsx";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {modifyTaskInWorkspace, newTaskInWorkspace} from "../../../api/endpoints-tasks.jsx";

export default function EditTaskNameModal(props) {
    const [show, setShow] = useState(false);
    const {workspaceId, task} = props;
    const [taskName, setTaskName] = useState(task.name);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        modifyTaskInWorkspace(
            localStorage.getItem("accessToken"),
            workspaceId,
            task.id,
            {"name": taskName}
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspaceId + "/tasks/" + task.id;
            }
        });
    };

    return (
        <>
            <a className="link-secondary" onClick={handleShow}><i className="bi bi-pencil-square"></i></a>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Change task name</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="text" placeholder="Task name"
                                      onChange={e => setTaskName(e.target.value)}
                                      className="mb-3" required={true} defaultValue={task.name}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" type="submit">Apply</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
