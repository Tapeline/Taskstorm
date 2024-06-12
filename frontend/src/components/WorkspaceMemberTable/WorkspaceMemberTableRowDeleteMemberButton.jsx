import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {modifyWorkspace} from "../../api/endpoints-workspaces.jsx";
import {toastError} from "../../ui/toasts.jsx";

export default function WorkspaceMemberTableRowDeleteMemberButton(props) {
    const {workspace, member} = props;
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        const newMembers = workspace.members.map(v => v.id);
        newMembers.splice(newMembers.indexOf(member.id), 1);
        modifyWorkspace(
            localStorage.getItem("accessToken"),
            workspace.id,
            {members: newMembers}
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspace.id + "/members";
            }
        });
    };

    return (
        <>
            <a className="link-danger" onClick={handleShow}><i className="bi bi-trash"></i></a>

            <Modal show={show} onHide={handleClose} className="alert-danger">
                <Modal.Header closeButton>
                    <Modal.Title>Expel {member.username}?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to expel {member.username} from this workspace?<br/>
                        You can re-add {member.username} later.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" type="submit" onClick={handleSubmit}>
                        Yes, I want to expel {member.username}</Button>
                    <Button variant="secondary" type="submit" onClick={handleClose}>
                        No, keep {member.username}</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
