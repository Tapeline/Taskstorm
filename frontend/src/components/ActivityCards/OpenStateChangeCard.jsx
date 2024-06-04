import BigIcon from "../Misc/BigIcon.jsx";
import HWhitespace from "../../utils/HWhitespace.jsx";
import React from "react";
import {dateConverter} from "../../utils/time.jsx";

export default function OpenStateChangeCard(props) {
    const {data, ...rest} = props;
    return (
        <div {...rest} className="d-flex justify-content-start align-items-center">
            {
                data.new_state
                    ? <BigIcon icon="exclamation-square"/>
                    : <BigIcon icon="check-lg"/>
            }
            <HWhitespace/>
            <div>
                <h6 className="mb-0">
                    {data.user.username}
                    {data.new_state ? " opened" : " closed"} this task
                </h6>
                <span className="small text-muted">{dateConverter(data.logged_at)}</span>
            </div>
        </div>
    );
}