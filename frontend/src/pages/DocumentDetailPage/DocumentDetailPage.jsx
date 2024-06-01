import Editor from "../../components/CollabEditor/Editor.jsx";

export default function DocumentDetailPage(props) {
    const {workspaceId} = props;

    return <Editor username={localStorage.getItem("accountUsername")}/>
}