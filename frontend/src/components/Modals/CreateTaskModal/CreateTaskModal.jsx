import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {newWorkspace} from "../../../api/endpoints-workspaces.jsx";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {newTaskInWorkspace} from "../../../api/endpoints-tasks.jsx";

export default function CreateTaskModal(props) {
    const [show, setShow] = useState(false);
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskTags, setTaskTags] = useState("");
    const [taskFolder, setTaskFolder] = useState("Public");
    const navigate = useNavigate();
    const {workspace} = props;

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        newTaskInWorkspace(
            localStorage.getItem("accessToken"),
            workspace.id,
            taskName,
            taskDescription,
            taskFolder,
            taskTags
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspace.id;
            }
        });
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>New task</Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>New task in {workspace.name}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="text" placeholder="Task name"
                                      onChange={e => setTaskName(e.target.value)}
                                      className="mb-3" required={true}/>
                        <Form.Control type="text" placeholder="Task description" as="textarea"
                                      onChange={e => setTaskDescription(e.target.value)}
                                      className="mb-3" required={true}/>
                        <Form.Control type="text" placeholder="Task folder"
                                      onChange={e => setTaskFolder(e.target.value)}
                                      className="mb-3" defaultValue={"Public"}/>
                        <Form.Control type="text" placeholder="Task tags (separated by space)"
                                      onChange={e => setTaskTags(e.target.value)}
                                      className="mb-3" defaultValue={""}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" type="submit">Create</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
