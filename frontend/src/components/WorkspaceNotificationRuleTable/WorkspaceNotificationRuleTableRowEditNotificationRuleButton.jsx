import React, {useState} from "react";
import {Button, Form, InputGroup, Modal} from "react-bootstrap";
import {toastError} from "../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {modifyRuleInWorkspace} from "../../api/endpoints-notifications.jsx";

export default function WorkspaceNotificationRuleTableRowEditNotificationRuleButton(props) {
    const {workspace, rule} = props;
    const [show, setShow] = useState(false);
    const [ruleFilter, setRuleFilter] = useState(rule.applicable_filter);
    const [ruleDelta, setRuleDelta] = useState(rule.time_delta);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        modifyRuleInWorkspace(
            localStorage.getItem("accessToken"),
            workspace.id,
            rule.id,
            {
                applicable_filter: ruleFilter,
                time_delta: ruleDelta
            }
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
            <Button variant="outline-primary" onClick={handleShow}><i className="bi bi-pencil-square"></i></Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit notification rule in {workspace.name}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="name-addon">Filter</InputGroup.Text>
                            <Form.Control type="text" defaultValue={rule.applicable_filter}
                                          onChange={e => setRuleFilter(e.target.value)}
                                          required={true}
                                          aria-describedby="name-addon"/>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="time-addon">Time delta (+HH:MM or -HH:MM)</InputGroup.Text>
                            <Form.Control type="text" defaultValue={rule.time_delta}
                                          onChange={e => setRuleDelta(e.target.value)}
                                          required={true}
                                          aria-describedby="time-addon"/>
                            <span className="text-muted mt-3">Time delta defines how early notification
                                will be issued:<br/>
                            E.g. -00:05 will issue a notification 5 minutes before arrangement,
                            +00:05 will issue it 5 minutes after arrangement.</span>
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
