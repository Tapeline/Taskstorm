import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {modifyCommentForTask} from "../../api/endpoints-comments.jsx";
import {toastError} from "../../ui/toasts.jsx";

export default function CommentCardEditCommentButton(props) {
    const [show, setShow] = useState(false);
    const {workspaceId, taskId, comment} = props;
    const [value, setValue] = useState(comment.text);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        modifyCommentForTask(
            localStorage.getItem("accessToken"),
            workspaceId,
            taskId,
            comment.id,
            {"text": value}
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspaceId + "/tasks/" + taskId;
            }
        });
    };

    return (
        <>
            <a className="link-secondary" onClick={handleShow}>
                <i className="bi bi-pencil-square"></i></a>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Change comment text</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="text" placeholder="Text" as="textarea"
                                      onChange={e => setValue(e.target.value)}
                                      className="mb-3" required={true} defaultValue={comment.text}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" type="submit">Apply</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
