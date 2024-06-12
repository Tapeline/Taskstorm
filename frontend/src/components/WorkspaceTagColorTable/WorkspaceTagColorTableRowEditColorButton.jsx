import React, {useState} from "react";
import {Button, Form, InputGroup, Modal} from "react-bootstrap";
import {modifyWorkspace} from "../../api/endpoints-workspaces.jsx";
import {toastError} from "../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {HexColorInput, HexColorPicker} from "react-colorful";

export default function WorkspaceTagColorTableRowEditColorButton(props) {
    const {workspace, tagColor, tagName} = props;
    const [show, setShow] = useState(false);
    const [chosenColor, setChosenColor] = useState(tagColor);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        const settings = workspace.settings;
        settings.tag_coloring[tagName] = chosenColor;
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
            <a className="link-primary" onClick={handleShow}><i className="bi bi-pencil-square"></i></a>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit tag color</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="name-addon">Name</InputGroup.Text>
                            <Form.Control type="text" defaultValue={tagName}
                                          required={true} disabled
                                          aria-describedby="name-addon"/>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <div>
                                <HexColorPicker color={chosenColor} onChange={setChosenColor}/>
                                <HexColorInput color={chosenColor} onChange={setChosenColor}/>
                            </div>
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
