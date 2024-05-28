import React, {useEffect, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {modifyTaskInWorkspace} from "../../../api/endpoints-tasks.jsx";
import {getWorkspace, modifyWorkspace} from "../../../api/endpoints-workspaces.jsx";
import {getAllUsers, getProfile} from "../../../api/endpoints-profile.jsx";

export default function AddWorkspaceMemberModal(props) {
    const [show, setShow] = useState(false);
    const {workspace} = props;
    const [memberIds, setMemberIds] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [profile, setProfile] = useState({});
    const [value, setValue] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setMemberIds(workspace.members?.map((v) => { return v.id; }));

        getProfile(localStorage.getItem("accessToken")).then((response) => {
            if (!response.success && response.status === 401) navigate("/login");
            else if (!response.success) toastError(response.reason);
            else setProfile(response.data);
        });
    }, []);

    useEffect(() => {
        getAllUsers(localStorage.getItem("accessToken")).then((response) => {
            if (!response.success && response.status === 401)  navigate("/login");
            else if (!response.success) toastError(response.reason);
            else {
                setAvailableUsers(response.data.filter(v => {
                    return !memberIds?.includes(v.id) && profile?.id !== v.id && workspace.owner.id !== v.id;
                }));
            }
        });
    }, [memberIds, profile]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        const memberId = value === "null" || value === null? null : parseInt(value);
        if (memberId === null) {
            toastError("Please select a valid user");
            return;
        }
        memberIds.push(memberId);
        modifyWorkspace(
            localStorage.getItem("accessToken"),
            workspace.id,
            {"members": memberIds}
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspace.id + "/members";
            }
        });
    };

    return (
        <>
            <Button onClick={handleShow}>Add member</Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add member</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Select onChange={(e) => {
                                         setValue(e.target.value);
                                     }}>
                            <option value="null">-- Select a user --</option>
                            {
                                availableUsers.map((data, id) => {
                                    return <option value={`${data.id}`} key={id}>{data.username}</option>;
                                })
                            }
                        </Form.Select>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" type="submit">Add</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
