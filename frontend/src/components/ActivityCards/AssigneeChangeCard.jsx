import BigIcon from "../Misc/BigIcon.jsx";
import HWhitespace from "../../utils/HWhitespace.jsx";
import React from "react";
import {dateConverter} from "../../utils/time.jsx";

export default function AssigneeChangeCard(props) {
    const {data, ...rest} = props;
    return (
        <div {...rest} className="d-flex justify-content-start align-items-center">
            {
                data.new_assignee !== null
                    ? <BigIcon icon="person-check"/>
                    : <BigIcon icon="person-dash"/>
            }
            <HWhitespace/>
            <div>
                <h6 className="mb-0">
                    {data.user.username}
                    {data.new_assignee !== null
                        ? <span> assigned this task to {data.new_assignee.username}</span>
                        : <span> unassigned this task</span>}
                </h6>
                <span className="small text-muted">{dateConverter(data.logged_at)}</span>
            </div>
        </div>
    );
}