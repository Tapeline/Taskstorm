import React from "react";
import WorkspaceTagColorTableRowDeleteColorButton from "./WorkspaceTagColorTableRowDeleteColorButton.jsx";
import WorkspaceTagColorTableRowEditColorButton from "./WorkspaceTagColorTableRowEditColorButton.jsx";

export default function WorkspaceTagColorRow(props) {
    const {workspace, tagName, tagColor} = props;

    return (
        <tr>
            <td>
                <span className="badge" style={{background: tagColor}}>{tagName}</span>
            </td>
            <td>
                <WorkspaceTagColorTableRowEditColorButton tagName={tagName}
                                                          tagColor={tagColor} workspace={workspace}/>
                <span className="mx-2"></span>
                <WorkspaceTagColorTableRowDeleteColorButton tagName={tagName}
                                                            tagColor={tagColor} workspace={workspace}/>
            </td>
        </tr>
    )
}