import QuillCursors from "quill-cursors";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import {getRandomVibrantColor} from "../../utils/colors.jsx";
import Preloader from "../Preloader/Preloader.jsx";
import OverlayingPreloader from "../Preloader/OverlayingPreloader.jsx";
import {v4 as uuidv4} from 'uuid';
import {wsUrl} from "../../api/common.jsx";

ReactQuill.Quill.register("modules/cursors", QuillCursors)

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    [ 'link', 'image', 'video', 'formula' ],
    ["blockquote", "code-block"],
    ["clean"],
];

const myId = crypto.randomUUID();

export default function Editor(props) {
    const quillRef = useRef();
    const { documentId } = useParams();
    const [socket, setSocket] = useState();
    const {username} = props;
    const [value, setValue] = useState("");
    const [isTextLoaded, setIsTextLoaded] = useState(false);
    const accessToken = localStorage.getItem("accessToken");

    useEffect(() => {
        const _socket = new WebSocket(wsUrl("editor/" + documentId));
        const editor = quillRef.current?.getEditor();
        const cursors = editor?.getModule('cursors');
        let timer;
        editor?.disable();
        editor?.setText("Loading...");

        _socket.onopen = () => {
            timer = setInterval(() => {
                _socket.send(JSON.stringify({
                    command: "save-document",
                    data: editor.getContents(),
                    documentId: documentId,
                    token: accessToken
                }))
            }, 3000);

            _socket.send(JSON.stringify({
                command: "get-document",
                documentId: documentId,
                token: accessToken
            }))

            _socket.send(JSON.stringify({
                command: "notify-join-room",
                username: username,
                uuid: myId,
                token: accessToken
            }))
        };

        _socket.onmessage = e => {
            const data = JSON.parse(e.data);
            if (data.command === "load-document") {
                editor.setContents(data.data);
                editor.enable();
                setIsTextLoaded(true);
            } else if (data.command === "receive-changes") {
                if (data.issuer === myId) return;
                if (quillRef.current == null || documentId !== data.documentId) return;
                editor?.updateContents(data.delta);
            } else if (data.command === "notify-join-room") {
                if (data.uuid === myId) return;
                cursors.createCursor(data.uuid, data.username, getRandomVibrantColor());
            } else if (data.command === "notify-leave-room") {
                if (data.uuid === myId) return;
                cursors.removeCursor(data.uuid);
            } else if (data.command === "notify-cursor-change") {
                if (data.uuid === myId) return;
                cursors.createCursor(data.uuid, data.username, getRandomVibrantColor());
                cursors.moveCursor(data.uuid, data.range);
            }
        };
        setSocket(_socket);

        return () => {
            clearInterval(timer);
            _socket.send(JSON.stringify({
                command: "notify-leave-room",
                username: username,
                uuid: myId,
                token: accessToken
            }))
            _socket.close();
        };
    }, []);

    const onTextChange = (value, delta, source) => {
        setValue(value);
        if (socket == null) return;
        if (source !== "user") return;
        socket?.send(JSON.stringify({
            command: "send-changes",
            delta: delta,
            documentId: documentId,
            issuer: myId,
            token: accessToken
        }));
    };

    const onSelectionChange = (range, oldRange, source) => {
        socket?.send(JSON.stringify({
            command: "notify-cursor-change",
            range: range,
            username: username,
            uuid: myId,
            token: accessToken
        }));
    }

    return (<>
        {
            !isTextLoaded? <OverlayingPreloader/> : ""
        }
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onTextChange}
            onChangeSelection={onSelectionChange}
            modules={{
                toolbar: TOOLBAR_OPTIONS,
                cursors: true
            }}
            ref={quillRef}
        />
    </>);
}
