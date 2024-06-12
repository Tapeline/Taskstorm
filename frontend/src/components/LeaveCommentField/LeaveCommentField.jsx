import {Button, Card, Form} from "react-bootstrap";
import React, {useState} from "react";
import {newCommentForTask} from "../../api/endpoints-comments.jsx";
import {toastError} from "../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";

export default function LeaveCommentField(props) {
    const {task} = props;
    const accessToken = localStorage.getItem("accessToken");
    const [text, setText] = useState("");
    const navigate = useNavigate();

    const handleSubmit = e => {
        e.preventDefault();
        newCommentForTask(accessToken, task.workspace.id, task.id, {
            text: text
        }).then(response => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                window.location.href = "/workspaces/" + task.workspace.id + "/tasks/" + task.id;
            }
        })
    }

    return <Form onSubmit={handleSubmit} className="mb-2">
        <Card>
            <Card.Body>
                <Card.Title>Leave a comment</Card.Title>
                <Form.Control type="text" as="textarea" className="mb-2"
                              onChange={e => setText(e.target.value)}
                              required={true}/>
                <Button variant="primary" type="submit">Post</Button>
            </Card.Body>
        </Card>
    </Form>;
}