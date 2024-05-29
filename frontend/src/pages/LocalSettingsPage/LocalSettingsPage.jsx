import {Form, InputGroup} from "react-bootstrap";
import React, {useState} from "react";
import {localSettings} from "../../utils/localSettings.jsx";

export default function LocalSettingsPage() {
    const [paramAutoAssign, setParamAutoAssign]
        = useState(localSettings.getBool("autoAssign"));

    return (<div className="px-lg-5">
        <h1>Local settings</h1>
        <p className="text-muted">Please note that these settings are stored locally
            in your browser and therefore are not synchronized with other devices</p>
        <br/>

        <InputGroup className="mb-3">
            <Form.Check onChange={e => {
                setParamAutoAssign(e.target.checked);
                localSettings.setBool("autoAssign", e.target.checked);
            }}
            label="Automatically assign new tasks to myself"
            checked={paramAutoAssign}/>
        </InputGroup>
    </div>);
}