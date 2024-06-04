import React, {useState} from "react";
import {Button, Form, InputGroup, Modal} from "react-bootstrap";
import {newWorkspace} from "../../../api/endpoints-workspaces.jsx";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {newTaskInWorkspace} from "../../../api/endpoints-tasks.jsx";
import {localSettings} from "../../../utils/localSettings.jsx";

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
        const data = {
            "name": taskName,
            "description": taskDescription,
            "folder": taskFolder,
            "tags": taskTags
        };
        if (localSettings.getBool("autoAssign"))
            data["assignee"] = parseInt(localStorage.getItem("accountId"));
        newTaskInWorkspace(
            localStorage.getItem("accessToken"),
            workspace.id,
            data
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
            <Button variant="primary" onClick={handleShow}>
                <i className="bi bi-plus-lg"></i>
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>New task in {workspace.name}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="name-addon">Name</InputGroup.Text>
                            <Form.Control type="text"
                                          onChange={e => setTaskName(e.target.value)}
                                          required={true}
                                          aria-describedby="name-addon"/>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="desc-addon">Description</InputGroup.Text>
                            <Form.Control type="text" as="textarea"
                                          onChange={e => setTaskDescription(e.target.value)}
                                          required={true}
                                          aria-describedby="desc-addon"/>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="cat-addon">Category</InputGroup.Text>
                            <Form.Control type="text"
                                          onChange={e => setTaskFolder(e.target.value)}
                                          defaultValue={"Public"}
                                          aria-describedby="cat-addon"/>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="tags-addon">Tags</InputGroup.Text>
                            <Form.Control type="text" placeholder="Task tags (separated by space)"
                                          onChange={e => setTaskTags(e.target.value)}
                                          defaultValue={""}
                                          aria-describedby="tags-addon"/>
                        </InputGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" type="submit">Create</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
