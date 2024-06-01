import Editor from "../../components/CollabEditor/Editor.jsx";
import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {getDocumentInWorkspace} from "../../api/endpoints-documents.jsx";
import Preloader from "../../components/Preloader/Preloader.jsx";
import OverlayingPreloader from "../../components/Preloader/OverlayingPreloader.jsx";

export default function DocumentDetailPage() {
    const {workspaceId, documentId} = useParams();
    const [documentData, setDocumentData] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        getDocumentInWorkspace(
            localStorage.getItem("accessToken"),
            workspaceId,
            documentId
        ).then(response => {
            if (!response.success && response.status === 404) {
                setNotFound(true);
            } else {
                setDocumentData(response.data);
            }
        })
    }, []);

    if (notFound) return <h1>Document not found</h1>;
    if (documentData === null) return <OverlayingPreloader/>;

    return (
        <div>
            <Link to={"/workspaces/" + workspaceId + "/documents"}>Back to document list</Link>
            <h1 className="my-4">
                <i className="bi bi-file-earmark-fill"></i> {documentData.title}
            </h1>
            <Editor username={localStorage.getItem("accountUsername")} documentId={documentId}/>
        </div>
    );
}