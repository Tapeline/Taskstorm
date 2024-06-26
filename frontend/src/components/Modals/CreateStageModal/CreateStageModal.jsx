import React, {useState} from "react";
import {Button, Form, InputGroup, Modal, Spinner} from "react-bootstrap";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {newStageInWorkspace} from "../../../api/endpoints-workflow.jsx";
import {HexColorPicker} from "react-colorful";
import {newWorkspace} from "../../../api/endpoints-workspaces.jsx";
import {confirmCreation} from "../../../api/common.jsx";

export default function CreateStageModal(props) {
    const [show, setShow] = useState(false);
    const [stageName, setStageName] = useState();
    const [stageColor, setStageColor] = useState("#000000");
    const [stageIsEnd, setStageIsEnd] = useState(false);
    const navigate = useNavigate();
    const {workspace} = props;
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        newStageInWorkspace(
            accessToken,
            workspace.id,
            {
                name: stageName,
                color: stageColor.substring(1),
                is_end: stageIsEnd
            }
        ).then((response) => {
            if (!response.success) toastError(response.reason);
            else confirmCreation(
                accessToken, "workspaces/" + workspace.id + "/stages", response.data.id
            ).then(r => {
                if (!r.success) toastError(r.reason)
                else {
                    handleClose();
                    window.location.href = "/workspaces/" + workspace.id + "/stages";
                }
            });
        });
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>New stage</Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>New stage in {workspace.name}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="name-addon">Name</InputGroup.Text>
                            <Form.Control type="text"
                                          onChange={e => setStageName(e.target.value)}
                                          required={true}
                                          aria-describedby="name-addon"/>
                        </InputGroup>
                        <InputGroup className="mb-3">
                             <HexColorPicker color={stageColor} onChange={setStageColor} />
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <Form.Check onChange={e => setStageIsEnd(e.target.value)}
                                        label="Is end?"/>
                        </InputGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" type="submit" disabled={isLoading}>
                            {isLoading
                                ? <Spinner as="span" animation="border"
                                    size="sm" role="status" aria-hidden="true"/>
                                : "Create"
                            }
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
