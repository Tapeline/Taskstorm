import {Col, ListGroup, Row, Tab} from "react-bootstrap";
import {Link} from "react-router-dom";

export default function CategorySwitcher(props) {
    const {children, defaultKey, ...rest} = props;

    return (
        <Tab.Container defaultActiveKey={defaultKey} {...rest}>
            <Row>
                <Col sm={2} className="mb-4">
                    <ListGroup>
                        {children.map((child, index) => {
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
    )
}
