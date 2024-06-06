import React from "react";
import {Table} from "react-bootstrap";
import WorkspaceTagColorRow from "./WorkspaceTagColorRow.jsx";
import WorkspaceTagColorRowCreateColorButton from "./WorkspaceTagColorRowCreateColorButton.jsx";

export default function WorkspaceTagColorTable(props) {
    const {workspace, tags} = props;

    const safeTags = tags === undefined || tags === null? {} : tags;

    return (
        <Table striped size="sm">
            <thead>
                <tr>
                    <th>Tag</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            {Object.entries(safeTags)?.map(([k, v], i) => {
                return <WorkspaceTagColorRow workspace={workspace}
                                             tagName={k} tagColor={v} key={i}/>;
            })}
            {Object.entries(safeTags).length === 0? <tr><td colSpan={3}>No custom colors for now</td></tr> : ""}
            <tr>
                <td colSpan={3}>
                    <WorkspaceTagColorRowCreateColorButton workspace={workspace}/>
                </td>
            </tr>
            </tbody>
        </Table>
    );
}
