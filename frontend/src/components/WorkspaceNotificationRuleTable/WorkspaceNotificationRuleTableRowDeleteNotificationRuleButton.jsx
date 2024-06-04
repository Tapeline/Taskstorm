import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {modifyWorkspace, removeWorkspace} from "../../api/endpoints-workspaces.jsx";
import {toastError} from "../../ui/toasts.jsx";
import {removeStageFromWorkspace} from "../../api/endpoints-workflow.jsx";
import {removeRuleFromWorkspace} from "../../api/endpoints-notifications.jsx";

export default function WorkspaceNotificationRuleTableRowDeleteNotificationRuleButton(props) {
    const {workspace, rule} = props;
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        removeRuleFromWorkspace(
            localStorage.getItem("accessToken"),
            workspace.id,
            rule.id
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspace.id + "/notifications";
            }
        });
    };

    return (
        <>
            <a className="link-danger" onClick={handleShow}><i className="bi bi-trash"></i></a>

            <Modal show={show} onHide={handleClose} className="alert-danger">
            <Modal.Header closeButton>
                    <Modal.Title>Delete rule?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this rule from this workspace?</p>
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
