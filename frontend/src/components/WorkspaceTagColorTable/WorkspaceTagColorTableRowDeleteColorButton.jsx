import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {modifyWorkspace, removeWorkspace} from "../../api/endpoints-workspaces.jsx";
import {toastError} from "../../ui/toasts.jsx";
import {removeStageFromWorkspace} from "../../api/endpoints-workflow.jsx";

export default function WorkspaceTagColorTableRowDeleteColorButton(props) {
    const {workspace, tagName} = props;
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        const settings = workspace.settings;
        delete settings.tag_coloring[tagName];
        modifyWorkspace(
            localStorage.getItem("accessToken"),
            workspace.id,
            {
                settings: settings
            }
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspace.id + "/manage#tags";
            }
        });
    };

    return (
        <>
            <a className="link-danger" onClick={handleShow}><i className="bi bi-trash"></i></a>

            <Modal show={show} onHide={handleClose} className="alert-danger">
                <Modal.Header closeButton>
                    <Modal.Title>Delete custom color?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete stage custom color for {tagName}?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" type="submit" onClick={handleSubmit}>
                        Yes</Button>
                    <Button variant="secondary" type="submit" onClick={handleClose}>
                        No</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
