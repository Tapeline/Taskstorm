import {Button, Card, Form, Spinner} from "react-bootstrap";
import React, {useState} from "react";
import {newCommentForTask} from "../../api/endpoints-comments.jsx";
import {toastError} from "../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {confirmCreation} from "../../api/common.jsx";

export default function LeaveCommentField(props) {
    const {task} = props;
    const accessToken = localStorage.getItem("accessToken");
    const [text, setText] = useState("");
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = e => {
        e.preventDefault();
        setIsLoading(true);
        newCommentForTask(accessToken, task.workspace.id, task.id, {
            text: text
        }).then(response => {
            if (!response.success) toastError(response.reason);
            else confirmCreation(
                localStorage.getItem("accessToken"),
                "workspaces/" + task.workspace.id + "/tasks/" + task.id + "/comments",
                response.data.id
            ).then(r => {
                if (!r.success) toastError(r.reason);
                else window.location.href = "/workspaces/" + task.workspace.id + "/tasks/" + task.id;
            });
        })
    }

    return <Form onSubmit={handleSubmit} className="mb-2">
        <Card>
            <Card.Body>
                <Card.Title>Leave a comment</Card.Title>
                <Form.Control type="text" as="textarea" className="mb-2"
                              onChange={e => setText(e.target.value)}
                              required={true}/>
                <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading
                        ? <Spinner as="span" animation="border"
                            size="sm" role="status" aria-hidden="true"/>
                        : "Post"
                    }
                </Button>
            </Card.Body>
        </Card>
    </Form>;
}