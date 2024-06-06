import React, {useEffect, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {modifyTaskInWorkspace} from "../../../api/endpoints-tasks.jsx";
import {getWorkspace} from "../../../api/endpoints-workspaces.jsx";
import {getProfile} from "../../../api/endpoints-profile.jsx";
import {getStagesInWorkspace} from "../../../api/endpoints-workflow.jsx";

export default function EditTaskStageModal(props) {
    const [show, setShow] = useState(false);
    const {workspaceId, task} = props;
    const [availableStages, setAvailableStages] = useState([]);
    const [profile, setProfile] = useState({});
    const [value, setValue] = useState(task.folder);
    const navigate = useNavigate();

    useEffect(() => {
        getProfile(localStorage.getItem("accessToken")).then((response) => {
            if (!response.success && response.status === 401) navigate("/login");
            else if (!response.success) toastError(response.reason);
            else setProfile(response.data);
        });
    }, []);

    useEffect(() => {
        getStagesInWorkspace(localStorage.getItem("accessToken"), workspaceId).then((response) => {
            if (!response.success && response.status === 401)  navigate("/login");
            else if (!response.success) toastError(response.reason);
            else setAvailableStages(response.data);
        });
    }, []);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        modifyTaskInWorkspace(
            localStorage.getItem("accessToken"),
            workspaceId,
            task.id,
            {"stage": value === "null"? null : parseInt(value)}
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspaceId + "/tasks/" + task.id;
            }
        });
    };

    return (
        <>
            <a className="link-secondary" onClick={handleShow}><i className="bi bi-pencil-square"></i></a>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Change stage</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Select onChange={(e) => {
                                         setValue(e.target.value);
                                     }} defaultValue={`${task.stage?.id}`}>
                            <option value="null">Unstaged</option>
                            {
                                availableStages.map((data, id) => {
                                    return <option key={id} value={`${data.id}`}>{data.name}</option>;
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
