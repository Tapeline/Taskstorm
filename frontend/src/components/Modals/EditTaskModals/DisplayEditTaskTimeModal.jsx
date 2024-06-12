import React, {useEffect, useState} from "react";
import {Button, Form, InputGroup, Modal} from "react-bootstrap";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {getTaskInWorkspace, modifyTaskInWorkspace} from "../../../api/endpoints-tasks.jsx";
import {toISOStringWithTimeZone} from "../../../utils/time.jsx";

export default function DisplayEditTaskTimeModal(props) {
    const {workspaceId, task, title, field} = props;
    const [show, setShow] = useState(false);
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (task.id === null || task.id === undefined) return;
        getTaskInWorkspace(localStorage.getItem("accessToken"), workspaceId, task.id).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else {
                if (task[field] !== null && task[field] !== undefined) {
                    const dateTimeObject = new Date(task[field]);
                    const isoString = toISOStringWithTimeZone(dateTimeObject);
                    setTime(isoString.slice(11, 16));
                    setDate(isoString.slice(0, 10));
                }
            }
        })
    }, [task]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e, reset=false) => {
        e.preventDefault();
        modifyTaskInWorkspace(
            localStorage.getItem("accessToken"),
            workspaceId,
            task.id,
            {[field]: (date !== "" && !reset) ? new Date(date + ' ' + time).toISOString() : null}
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
            {date !== "" && date !== null
                ? <b>{date} {time}</b>
                : <span className="text-secondary">None</span>
            }&nbsp;
            <a className="link-secondary" onClick={handleShow}><i className="bi bi-pencil-square"></i></a>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <InputGroup className="mb-2">
                            <InputGroup.Text id="date-addon">Date</InputGroup.Text>
                            <Form.Control type="date" aria-describedby="date-addon" value={date}
                                          onChange={e => {setDate(e.target.value)}}/>
                        </InputGroup>
                        <InputGroup className="mb-2">
                            <InputGroup.Text id="date-addon">Time</InputGroup.Text>
                            <Form.Control type="time" aria-describedby="date-addon" value={time}
                                          onChange={e => {setTime(e.target.value)}}/>
                        </InputGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={e => {
                            setDate("");
                            setTime("");
                            handleSubmit(e, true);
                        }}>Set null</Button>
                        <Button variant="primary" type="submit">Apply</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
