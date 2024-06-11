import React from "react";
import {Link} from "react-router-dom";
import {Badge, Card} from "react-bootstrap";
import EditTaskTagsModal from "../Modals/EditTaskModals/EditTaskTagsModal.jsx";
import ColorHash from "color-hash";

export default function TaskCard(props) {
    const {data} = props;

    const colorHash = new ColorHash({
        lightness: 0.35,
        saturation: 1,
    });

    return (
        <Card className="mb-2">
            <Card.Body>
                <Card.Title>
                    {
                        data.is_open
                            ? <Badge pill bg="warning" text="dark">Open</Badge>
                            : <Badge pill bg="secondary" text="light">Closed</Badge>
                    }&nbsp;
                    <Link to={"/workspaces/" + data.workspace.id + "/tasks/" + data.id + "/"}>
                        {data.name}
                    </Link>
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                    {
                        data.tags.length !== 0
                            ? <><span className="small">Tags:</span><span>&nbsp;{
                                data.tags.split(" ").map((tag, index) => {
                                    let color = colorHash.hex(tag);
                                    if (data.workspace.settings.tag_coloring[tag] !== undefined)
                                        color = data.workspace.settings.tag_coloring[tag];
                                    return <span className="badge me-1" key={index} style={{
                                        background: color
                                    }}>{tag}</span>;
                                })
                            }</span></>
                            : <span className="small">No tags</span>
                    }
                </Card.Subtitle>
                <Card.Subtitle className="mb-2 small text-muted">by {data.creator.username}</Card.Subtitle>
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
                {/*<Link to={"/workspaces/" + data.workspace.id + "/tasks/" + data.id + "/"}>Details</Link>*/}
            </Card.Body>
        </Card>
    )
}
