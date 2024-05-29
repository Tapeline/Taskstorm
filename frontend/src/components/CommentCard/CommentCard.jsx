import React from "react";
import {Link} from "react-router-dom";
import {Badge, Card} from "react-bootstrap";
import {dateConverter} from "../../utils/time.jsx";
import CommentCardEditCommentButton from "./CommentCardEditCommentButton.jsx";
import VWhitespace from "../../utils/VWhitespace.jsx";
import HWhitespace from "../../utils/HWhitespace.jsx";
import CommentCardDeleteCommentButton from "./CommentCardDeleteCommentButton.jsx";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownRender from "../Markdown/MarkdownRender.jsx";

export default function CommentCard(props) {
    const {workspaceId, data} = props;

    return (
        <Card className="mb-2">
            <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">
                    {
                        data.user.id === parseInt(localStorage.getItem("accountId"))?
                        <>
                            <CommentCardDeleteCommentButton workspaceId={workspaceId}
                                                  taskId={data.task.id} comment={data}/>
                            <HWhitespace/>
                            <CommentCardEditCommentButton workspaceId={workspaceId}
                                                  taskId={data.task.id} comment={data}/>
                            <HWhitespace/>
                        </>
                        : ""
                    }
                    by {data.user.username} at {dateConverter(data.posted_at)}
                </Card.Subtitle>
                <Card.Text>
                    <MarkdownRender text={data.text}/>
                </Card.Text>
            </Card.Body>
        </Card>
    )
}
