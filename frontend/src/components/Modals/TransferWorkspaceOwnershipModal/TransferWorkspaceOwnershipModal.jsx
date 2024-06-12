import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {modifyWorkspace} from "../../../api/endpoints-workspaces.jsx";

export default function TransferWorkspaceOwnershipModal(props) {
    const [show, setShow] = useState(false);
    const {workspace} = props;
    const [value, setValue] = useState(workspace.members[0]?.id);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (value === null || value === "null") return;
        modifyWorkspace(
            localStorage.getItem("accessToken"),
            workspace.id,
            {"owner": parseInt(value)}
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspace.id + "/manage";
            }
        });
    };

    return (
        <>
            <Button variant="outline-secondary" onClick={handleShow}>Transfer ownership</Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Transfer ownership of workspace {}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Select onChange={(e) => {
                                         setValue(e.target.value);
                                     }}>
                            {
                                workspace.members?.map((data, id) => {
                                    return <option value={`${data.id}`} key={id}>{data.username}</option>;
                                })
                            }
                        </Form.Select>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" type="submit">Apply</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
