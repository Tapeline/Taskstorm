import React from "react";
import WorkspaceNotificationRuleTableRowDeleteNotificationRuleButton from "./WorkspaceNotificationRuleTableRowDeleteNotificationRuleButton.jsx";
import WorkspaceNotificationRuleTableRowEditNotificationRuleButton from "./WorkspaceNotificationRuleTableRowEditNotificationRuleButton.jsx";

export default function WorkspaceNotificationRuleTableRow(props) {
    const {workspace, rule} = props;

    return (
        <tr>
            <td># {rule.id}</td>
            <td><code>{rule.applicable_filter}</code></td>
            <td>{rule.time_delta}</td>
            <td>
                <WorkspaceNotificationRuleTableRowEditNotificationRuleButton
                    rule={rule} workspace={workspace}/>
                <span className="mx-2"></span>
                <WorkspaceNotificationRuleTableRowDeleteNotificationRuleButton
                    rule={rule} workspace={workspace}/>
            </td>
        </tr>
    )
}