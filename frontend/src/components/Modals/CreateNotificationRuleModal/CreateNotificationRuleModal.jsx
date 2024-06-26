import React, {useState} from "react";
import {Button, Form, InputGroup, Modal, Spinner} from "react-bootstrap";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {newRuleInWorkspace} from "../../../api/endpoints-notifications.jsx";
import {confirmCreation} from "../../../api/common.jsx";

export default function CreateNotificationRuleModal(props) {
    const [show, setShow] = useState(false);
    const [ruleFilter, setRuleFilter] = useState("");
    const [ruleDelta, setRuleDelta] = useState("");
    const navigate = useNavigate();
    const {workspace} = props;
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        newRuleInWorkspace(
            localStorage.getItem("accessToken"),
            workspace.id,
            {
                applicable_filter: ruleFilter,
                time_delta: ruleDelta
            }
        ).then((response) => {
            if (!response.success) toastError(response.reason);
            else confirmCreation(
                localStorage.getItem("accessToken"),
                "workspaces/" + workspace.id + "/notification-rules",
                response.data.id
            ).then(r => {
                if (!r.success) toastError(r.reason)
                else {
                    handleClose();
                    window.location.href = "/workspaces/" + workspace.id + "/notifications";
                }
            });
        });
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>New rule</Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>New notification rule in {workspace.name}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="name-addon">Filter</InputGroup.Text>
                            <Form.Control type="text"
                                          onChange={e => setRuleFilter(e.target.value)}
                                          required={true}
                                          aria-describedby="name-addon"/>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="time-addon">Time delta (+HH:MM or -HH:MM)</InputGroup.Text>
                            <Form.Control type="text"
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
