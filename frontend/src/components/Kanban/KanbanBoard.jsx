import React, {useEffect, useState} from "react";
import {DragDropContext} from "react-beautiful-dnd";
import KanbanBoardColumn from "./KanbanBoardColumn.jsx";
import {getAllTasksInWorkspace, modifyTaskInWorkspace} from "../../api/endpoints-tasks.jsx";
import {useNavigate} from "react-router-dom";
import {getStagesInWorkspace} from "../../api/endpoints-workflow.jsx";
import {Row} from "react-bootstrap";

export default function KanbanBoard(props) {
    const {filter, workspace} = props;
    const [columns, setColumns] =
        useState([{title: "Unstaged", stage: null, tasks: [], stageData: null}]);
    const [columnIds, setColumnIds] = useState([null]);
    const accessToken = localStorage.getItem("accessToken");
    const navigate = useNavigate();

    if (accessToken === null) {
        navigate("login/");
        return;
    }

    useEffect(() => {
        getStagesInWorkspace(accessToken, workspace.id).then(response => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else {
                const _columns = [{title: "Unstaged", stage: null,
                    tasks: [], stageData: null}];
                const _columnIds = [null];
                response.data.map(stage => {
                    _columns.push({title: stage.name, stage: stage.id, tasks: [], stageData: stage});
                    _columnIds.push(stage.id);
                })
                setColumns(_columns);
                setColumnIds(_columnIds);
            }
        });
    }, []);

    useEffect(() => {
        getAllTasksInWorkspace(accessToken, workspace.id, filter).then(response => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else {
                const _columns = columns.slice();
                _columns.map(col => { col.tasks = []; })
                response.data.map(task => {
                    console.log("TASK", task, columnIds, _columns);
                    _columns[columnIds.indexOf(task.stage === null? null : task.stage.id)]?.tasks.push(task);
                })
                setColumns(_columns);
            }
        });
    }, [columnIds]);

    const handleDragEnd = result => {
        const {destination, source, draggableId} = result;
        if (!destination) return;
        const fromStage = parseInt(source.droppableId.substring(2));
        const toStage = parseInt(destination.droppableId.substring(2));
        const taskId = parseInt(draggableId.substring(2));
        console.log(taskId);
        const newColumns = columns.slice();
        const oldColumns = columns.slice();
        let removedTask;
        newColumns[columnIds.indexOf(fromStage)].tasks =
            newColumns[columnIds.indexOf(fromStage)].tasks.filter(task => {
                if (task.id === taskId) {
                    removedTask = task;
                    return false;
                }
                return true;
            });
        removedTask.is_open = !newColumns[columnIds.indexOf(toStage)].stageData?.is_end;
        newColumns[columnIds.indexOf(toStage)].tasks.push(removedTask);
        setColumns(newColumns);
        modifyTaskInWorkspace(
            accessToken, workspace.id, taskId, {stage: toStage}
        ).then(response => {
            if (!response.success && response.status === 401) navigate("/login");
            else if (!response.success) setColumns(oldColumns);
        });
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Row>
                {
                    columns.map((column, id) => {
                        return <KanbanBoardColumn key={id} column={column} colId={column.stage}
                                                  stageData={column.stageData} workspaceId={workspace.id}/>;
                    })
                }
            </Row>
        </DragDropContext>
    );
}