import React, {useState} from "react";
import {Button, Form, InputGroup, Modal} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {HexColorInput, HexColorPicker} from "react-colorful";
import {modifyWorkspace} from "../../api/endpoints-workspaces.jsx";
import {toastError} from "../../ui/toasts.jsx";

export default function WorkspaceTagColorRowCreateColorButton(props) {
    const [show, setShow] = useState(false);
    const [tagName, setTagName] = useState();
    const [tagColor, setTagColor] = useState("#000000");
    const navigate = useNavigate();
    const {workspace} = props;

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        const settings = workspace.settings;
        settings.tag_coloring[tagName] = tagColor;
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
            <Button className="w-100" variant="primary" onClick={handleShow}>New color</Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>New custom color in {workspace.name}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="name-addon">Name</InputGroup.Text>
                            <Form.Control type="text"
                                          onChange={e => setTagName(e.target.value)}
                                          required={true}
                                          aria-describedby="name-addon"/>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <div>
                                <HexColorPicker color={tagColor} onChange={setTagColor}/>
                                <HexColorInput color={tagColor} onChange={setTagColor}/>
                            </div>
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
