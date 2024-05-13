import React from "react";
import {Link} from "react-router-dom";
import {Card} from "react-bootstrap";

export default function TaskCard(props) {
    const {data} = props;

    return (
        <Card className="mb-2">
            <Card.Body>
                <Card.Title>{data.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Creator: {data.creator.username}</Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">Assignee: {data.assignee?.username}</Card.Subtitle>
                <Link to={"/workspaces/" + data.workspace.id + "/tasks/" + data.id + "/"}>Details</Link>
            </Card.Body>
        </Card>
    )
}
