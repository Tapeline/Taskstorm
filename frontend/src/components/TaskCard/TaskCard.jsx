import React from "react";
import {Link} from "react-router-dom";
import {Badge, Card} from "react-bootstrap";

export default function TaskCard(props) {
    const {data} = props;

    return (
        <Card className="mb-2">
            <Card.Body>
                <Card.Title>
                    {
                        data.is_open
                            ? <Badge pill bg="warning" text="dark">Open</Badge>
                            : <Badge pill bg="secondary" text="dark">Closed</Badge>
                    }&nbsp;
                    {data.name}
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted">by {data.creator.username}</Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">{
                    data.assignee !== null
                        ? <span className="small"> Assigned to {data.assignee?.username}</span>
                        : <span className="small"> Unassigned</span>
                }</Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">{
                    data.stage !== null
                        ? <span className="small"> Stage:&nbsp;
                            <i className="bi bi-circle-fill"
                               style={{color: "#" + data.stage?.color}}></i>&nbsp;
                            {data.stage?.name}</span>
                        : <span className="small"> Unstaged</span>
                }</Card.Subtitle>
                <Link to={"/workspaces/" + data.workspace.id + "/tasks/" + data.id + "/"}>Details</Link>
            </Card.Body>
        </Card>
    )
}
