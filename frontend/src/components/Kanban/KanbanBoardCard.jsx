import React from "react";
import {Draggable} from "react-beautiful-dnd";
import {Badge, Card} from "react-bootstrap";
import {Link} from "react-router-dom";

export default function KanbanBoardCard(props) {
    const {workspaceId, task, index} = props;
    return (
        <Draggable draggableId={`kt${task.id}`} index={index}>
        {(provided, snapshot) => (
            <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}
                 className="mb-2">
                <Card>
                    <Card.Body>
                        {
                            task.is_open
                                ? <Badge pill bg="warning" text="dark">Open</Badge>
                                : <Badge pill bg="secondary" text="light">Closed</Badge>
                        }&nbsp;
                        <Link to={"/workspaces/" + workspaceId + "/tasks/" + task.id}
                              className="link-primary">
                            {task.name}
                        </Link>
                    </Card.Body>
                </Card>
            </div>
        )}
        </Draggable>
    );
}
