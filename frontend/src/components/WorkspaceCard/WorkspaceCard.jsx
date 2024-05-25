import React from "react";
import {Link} from "react-router-dom";
import {Card} from "react-bootstrap";

export default function WorkspaceCard(props) {
    const {data} = props;

    return (
        <Card className="mb-2">
            <Card.Body>
                <Card.Title>{data.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Owner: {data.owner.username}</Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">Members: {data.members.length}</Card.Subtitle>
                <Link to={"/workspaces/" + data.id}>Open</Link>
            </Card.Body>
        </Card>
    )
}
