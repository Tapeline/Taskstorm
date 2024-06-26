import React from "react";
import {Card} from "react-bootstrap";
import {dateConverter} from "../../utils/time.jsx";
import CommentCardEditCommentButton from "./CommentCardEditCommentButton.jsx";
import HWhitespace from "../../utils/HWhitespace.jsx";
import CommentCardDeleteCommentButton from "./CommentCardDeleteCommentButton.jsx";
import MarkdownRender from "../Markdown/MarkdownRender.jsx";
import ProfilePic from "../Misc/ProfilePic.jsx";

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
                    by <ProfilePic url={data.user.profile_pic} size={24}/>&nbsp;
                    {data.user.username} at {dateConverter(data.posted_at)}
                </Card.Subtitle>
                <Card.Text>
                    <MarkdownRender text={data.text}/>
                </Card.Text>
            </Card.Body>
        </Card>
    )
}
