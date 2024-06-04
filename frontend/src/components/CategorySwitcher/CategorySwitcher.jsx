import {Col, ListGroup, Row, Tab} from "react-bootstrap";
import {Link} from "react-router-dom";

export default function CategorySwitcher(props) {
    const {children, placement, defaultKey, ...rest} = props;
    let childArray = children;
    if (!Array.isArray(children)) childArray = [children];
    if (placement === "horizontal") {
        return (
            <Tab.Container defaultActiveKey={defaultKey} {...rest}>
                <Col>
                    <div className="mb-4">
                        <ListGroup horizontal className="flex-wrap">
                            {childArray?.map((child, index) => {
                                return <ListGroup.Item action href={child.props.tabId} key={index}>
                                    {child.props.name}
                                </ListGroup.Item>;
                            })}
                        </ListGroup>
                    </div>
                    <Col sm={10}>
                        <Tab.Content>
                            {children}
                        </Tab.Content>
                    </Col>
                </Col>
            </Tab.Container>
        );
    } else {
        return (
            <Tab.Container defaultActiveKey={defaultKey} {...rest}>
                <Row>
                    <Col sm={2} className="mb-4">
                        <ListGroup>
                            {childArray?.map((child, index) => {
                                return <ListGroup.Item action href={child.props.tabId} key={index}>
                                    {child.props.name}
                                </ListGroup.Item>;
                            })}
                        </ListGroup>
                    </Col>
                    <Col sm={10}>
                        <Tab.Content>
                            {children}
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        );
    }
}
