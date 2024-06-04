import {Tab} from "react-bootstrap";

export default function CategoryPanel(props) {
    const {name, tabId, children, level} = props;

    let heading = <h3>{name}</h3>;
    if (level === 1) heading = (<h1>{name}</h1>);
    if (level === 2) heading = (<h2>{name}</h2>);
    if (level === 3) heading = (<h3>{name}</h3>);
    if (level === 4) heading = (<h4>{name}</h4>);
    if (level === 5) heading = (<h5>{name}</h5>);
    if (level === 6) heading = (<h6>{name}</h6>);

    return <Tab.Pane eventKey={tabId}>
        {heading}
        {children}
    </Tab.Pane>;
}
