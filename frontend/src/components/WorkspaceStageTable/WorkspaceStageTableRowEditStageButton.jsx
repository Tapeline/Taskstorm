import React, {useState} from "react";
import {Button, Form, InputGroup, Modal} from "react-bootstrap";
import {newWorkspace} from "../../api/endpoints-workspaces.jsx";
import {toastError} from "../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {newTaskInWorkspace} from "../../api/endpoints-tasks.jsx";
import {modifyStageInWorkspace, newStageInWorkspace} from "../../api/endpoints-workflow.jsx";
import {HexColorPicker} from "react-colorful";

export default function WorkspaceStageTableRowEditStageButton(props) {
    const {workspace, stage} = props;
    const [show, setShow] = useState(false);
    const [stageName, setStageName] = useState(stage.name);
    const [stageColor, setStageColor] = useState("#" + stage.color);
    const [stageIsEnd, setStageIsEnd] = useState(stage.is_end);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        modifyStageInWorkspace(
            localStorage.getItem("accessToken"),
            workspace.id,
            stage.id,
            {
                name: stageName,
                color: stageColor.substring(1),
                is_end: stageIsEnd
            }
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspace.id + "/stages";
            }
        });
    };

    return (
        <>
            {/*<Button variant="outline-primary" onClick={handleShow}>*/}
            {/*    <i className="bi bi-pencil-square"></i>*/}
            {/*</Button>*/}
            <a className="link-primary" onClick={handleShow}><i className="bi bi-pencil-square"></i></a>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit stage</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="name-addon">Name</InputGroup.Text>
                            <Form.Control type="text" defaultValue={stage.name}
                                          onChange={e => setStageName(e.target.value)}
                                          required={true}
                                          aria-describedby="name-addon"/>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <HexColorPicker color={stageColor} onChange={setStageColor}/>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <Form.Check onChange={e => setStageIsEnd(e.target.checked)}
                                        label="Is end?" checked={stage.is_end}/>
                        </InputGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" type="submit">Apply</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
