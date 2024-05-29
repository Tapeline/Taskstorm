import React, {useEffect, useState} from "react";
import {Col, Form, InputGroup, Pagination, Row} from "react-bootstrap";

export default function Paginator(props) {
    const {children} = props;
    const data = children;
    const [itemsPerPage, setItemsPerPage] =useState(5);
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState( 0);
    const [pages, setPages] = useState([]);
    const elementGUID = crypto.randomUUID();

    const renewPages = () => {
        const _pageCount = Math.ceil(data?.length / itemsPerPage);
        setPageCount(_pageCount);
        const _pages = [];
        for (let pageIndex = 0; pageIndex < _pageCount; pageIndex++) {
            const page = [];
            for (let i = pageIndex * itemsPerPage; i < (pageIndex + 1) * itemsPerPage; i++) {
                if (data?.length <= i) break;
                page.push(data[i]);
            }
            _pages.push(page);
        }
        setPages(_pages);
    }

    useEffect(renewPages, [itemsPerPage]);
    useEffect(renewPages, []);

    return (
        <div className="t-pagination">
            <Row>
                <Col>
                    <Pagination>
                        <Pagination.First
                            onClick={() => setCurrentPage(0)}/>
                        <Pagination.Prev
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}/>
                        {
                            currentPage > 0 ? <Pagination.Item
                                onClick={() => setCurrentPage(currentPage - 1)}>
                                {currentPage}</Pagination.Item> : ""
                        }
                        <Pagination.Item active>{currentPage + 1}</Pagination.Item>
                        {
                            currentPage < pageCount - 1 ? <Pagination.Item
                                onClick={() => setCurrentPage(currentPage + 1)}>
                                {currentPage + 2}</Pagination.Item> : ""
                        }
                        <Pagination.Next
                            onClick={() => setCurrentPage(Math.min(pageCount - 1,
                                currentPage + 1))}/>
                        <Pagination.Last
                            onClick={() => setCurrentPage(pageCount - 1)}/>
                    </Pagination>
                </Col>
                <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id={"pagination-items-" + elementGUID}>
                            Items per page</InputGroup.Text>
                        <Form.Control type="number" value={itemsPerPage}
                                      onChange={e => setItemsPerPage(e.target.value)}
                                      aria-describedby={"pagination-items-" + elementGUID}/>
                    </InputGroup>
                </Col>
            </Row>
            <div>
                {
                    pages[currentPage]
                }
            </div>
        </div>
    )
}