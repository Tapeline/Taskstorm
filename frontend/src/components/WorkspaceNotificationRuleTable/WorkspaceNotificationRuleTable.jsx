import React from "react";
import {Table} from "react-bootstrap";
import WorkspaceNotificationRuleTableRow from "./WorkspaceNotificationRuleTableRow.jsx";

export default function WorkspaceNotificationRuleTable(props) {
    const {workspace, rules} = props;

    return (
        <Table striped size="sm">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Filter</th>
                    <th>Delta</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            {rules?.map((value, index) => {
                return <WorkspaceNotificationRuleTableRow workspace={workspace} rule={value} key={index}/>;
            })}
            {rules?.length === 0? <tr><td colSpan={4}>No rules for now</td></tr> : ""}
            </tbody>
        </Table>
    );
}
