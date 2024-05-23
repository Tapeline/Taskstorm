import React from "react";
import WorkspaceMemberTableRowDeleteMemberButton from "./WorkspaceMemberTableRowDeleteMemberButton.jsx";

export default function WorkspaceMemberTableRow(props) {
    const {workspace, member} = props;

    return (
        <tr>
            <td># {member.id}</td>
            <td>{member.username}</td>
            <td><WorkspaceMemberTableRowDeleteMemberButton member={member} workspace={workspace}/></td>
        </tr>
    )
}