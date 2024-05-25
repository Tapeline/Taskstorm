import React from "react";
import {Table} from "react-bootstrap";
import WorkspaceMemberTableRow from "./WorkspaceMemberTableRow.jsx";

export default function WorkspaceMemberTable(props) {
    const {workspace} = props;

    return (
        <Table striped size="sm">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            {workspace.members?.map((value, index) => {
                return <WorkspaceMemberTableRow workspace={workspace} member={value} key={index}/>;
            })}
            {workspace.members?.length === 0? <tr><td colSpan={3}>No members for now</td></tr> : ""}
            </tbody>
        </Table>
    );
}
