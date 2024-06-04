import React from "react";
import {Droppable} from "react-beautiful-dnd";
import KanbanBoardCard from "./KanbanBoardCard.jsx";
import {Card, Col} from "react-bootstrap";

export default function KanbanBoardColumn(props) {
    const {column, colId, stageData, workspaceId} = props;
    return (
        //<Col style={{minHeight: "50vh", minWidth: "200px"}}>
        <Col lg className="mb-3">
            <h5>{column.title}
                <i className="bi bi-circle-fill ms-2"
                   style={{color: "#" + stageData?.color}}></i></h5>
            <Droppable droppableId={`kc${colId}`}>
                {(provided, snapshot) => (
                    <Card {...provided.droppableProps} ref={provided.innerRef}
                          style={{minHeight: "64px"}} className="p-2">
                        {column.tasks.map((task, index) => (
                            <KanbanBoardCard key={task.id} task={task} index={index} workspaceId={workspaceId}/>
                        ))}
                        {provided.placeholder}
                    </Card>
                )}
            </Droppable>
        </Col>
    );
}
