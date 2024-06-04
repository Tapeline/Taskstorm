import BigIcon from "../Misc/BigIcon.jsx";
import HWhitespace from "../../utils/HWhitespace.jsx";
import React from "react";
import {dateConverter} from "../../utils/time.jsx";

export default function WorkflowPushCard(props) {
    const {data, ...rest} = props;
    return (
        <div {...rest} className="d-flex justify-content-start align-items-center">
            <BigIcon icon="flag"/>
            <HWhitespace/>
            <div>
                <h6 className="mb-0">{data.user.username} pushed this task <span
                    className="small text-muted">{dateConverter(data.logged_at)}</span></h6>
                <span className="text-muted">from</span>
                <HWhitespace/>
                <b>{data.from_stage !== null
                    ? <span className="small">
                        <i className="bi bi-circle-fill"
                           style={{color: "#" + data.from_stage?.color}}></i>&nbsp;
                        {data.from_stage?.name}</span>
                    : <span className="small">Unstaged</span>}</b>
                <HWhitespace/>
                <span className="text-muted">to</span>
                <HWhitespace/>
                <b>{data.to_stage !== null
                    ? <span className="small">
                        <i className="bi bi-circle-fill"
                           style={{color: "#" + data.to_stage?.color}}></i>&nbsp;
                        {data.to_stage?.name}</span>
                    : <span className="small">Unstaged</span>}</b>
            </div>
        </div>
    );
}