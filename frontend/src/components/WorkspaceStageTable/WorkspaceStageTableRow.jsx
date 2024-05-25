import React from "react";
import WorkspaceStageTableRowDeleteStageButton from "./WorkspaceStageTableRowDeleteStageButton.jsx";
import WorkspaceStageTableRowEditStageButton from "./WorkspaceStageTableRowEditStageButton.jsx";

export default function WorkspaceStageTableRow(props) {
    const {workspace, stage} = props;

    return (
        <tr>
            <td># {stage.id}</td>
            <td><i className="bi bi-circle-fill" style={{color: "#" + stage?.color}}></i> {stage.name}</td>
            <td>{stage.is_end ? "Yes" : "No"}</td>
            <td>
                <WorkspaceStageTableRowEditStageButton stage={stage} workspace={workspace}/>
                <span className="mx-2"></span>
                <WorkspaceStageTableRowDeleteStageButton stage={stage} workspace={workspace}/>
            </td>
        </tr>
    )
}