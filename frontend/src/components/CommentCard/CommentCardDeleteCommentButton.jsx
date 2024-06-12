import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {toastError} from "../../ui/toasts.jsx";
import {removeCommentForTask} from "../../api/endpoints-comments.jsx";

export default function CommentCardDeleteCommentButton(props) {
    const {workspaceId, taskId, comment} = props;
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        removeCommentForTask(
            localStorage.getItem("accessToken"),
            workspaceId,
            taskId,
            comment.id
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspaceId + "/task/" + taskId;
            }
        });
    };

    return (
        <>
            <a className="text-danger" onClick={handleShow}><i className="bi bi-trash"></i></a>

            <Modal show={show} onHide={handleClose} className="alert-danger">
                <Modal.Header closeButton>
                    <Modal.Title>Delete comment?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this comment?<br/>
                        {comment.text}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" type="submit" onClick={handleSubmit}>
                        Yes</Button>
                    <Button variant="secondary" type="submit" onClick={handleClose}>
                        No</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
