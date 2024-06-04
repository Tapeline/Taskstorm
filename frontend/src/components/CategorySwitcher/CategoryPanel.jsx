import {Tab} from "react-bootstrap";

export default function CategoryPanel(props) {
    const {name, tabId, children} = props;

    return <Tab.Pane eventKey={tabId}>
        <h3>{name}</h3>
        {children}
    </Tab.Pane>;
}
