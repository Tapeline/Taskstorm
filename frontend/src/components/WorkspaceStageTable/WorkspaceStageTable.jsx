import React from "react";
import {Table} from "react-bootstrap";
import WorkspaceStageTableRow from "./WorkspaceStageTableRow.jsx";

export default function WorkspaceStageTable(props) {
    const {workspace, stages} = props;

    return (
        <Table striped size="sm">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Is End?</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            {stages?.map((value, index) => {
                return <WorkspaceStageTableRow workspace={workspace} stage={value} key={index}/>;
            })}
            {stages?.length === 0? <tr><td colSpan={4}>No stages for now</td></tr> : ""}
            </tbody>
        </Table>
    );
}
