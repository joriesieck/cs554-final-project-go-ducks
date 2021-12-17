import {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { checkString } from '../../utils/inputChecks';
import {
    getUserByEmail,
    searchUsersByName,
    addFriend,
    removeFriend, 
    removePendingFriend,
    acceptPendingFriend,
    getAllFriends,
    getAllPendingFriends
} from '../../utils/backendCalls';
import {
    Grid,
    Button,
    TextField,
    Modal
} from '@mui/material';
import { Box } from "@mui/system";
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import styles from './Friends.module.css';

export default function Friends() {
    const [ userData, setUserData ] = useState(null);
    const [ searchResults, setSearchResults ] = useState(null);
    const [ friends, setFriends ] = useState(null);
    const [ pendingFriends, setPendingFriends] = useState(null);
    const [ error, setError ] = useState(null);
    const [ searchError, setSearchError ] = useState(null);
    const [ openSearchModal, setOpenSearchModal ] = useState(false);
    const [ openRemoveModal, setOpenRemoveModal ] = useState(false);
    const [ openRejectModal, setOpenRejectModal ] = useState(false);
    const [ openAcceptModal, setOpenAcceptModal ] = useState(false);

    const user = useSelector((state) => state.user);

    // get user, need username to get friends
    useEffect(() => {
        async function fetchUserData() {
            let data;
            try {
                data = await getUserByEmail(user);
                const friends = await getAllFriends(data.username);
                const pending = await getAllPendingFriends(data.username);
                setUserData(data);
                setFriends(friends);
                setPendingFriends(pending);
            } catch (e){
                if (!e.response || !e.response.data || !e.response.data.error){
                    setError(e.toString());
                    return;
                }
                setError(e.response.data.error);
                return;
            }
        }
        fetchUserData();
    }, [user]);

    // check logged in, if not redirect
    if (!user) return <Redirect to="/" />

    const searchUsers = async (e) => {
        e.preventDefault();
        
        let searchTerm = e.target[0].value;
        // input check
        try {
            searchTerm = checkString(searchTerm, 'Search Term', false);
        } catch (e) {

        }
        // perform search
        let results;
        try {
            results = await searchUsersByName(searchTerm);
            console.log(results)
            setSearchResults(results);
            setOpenSearchModal(true);
        } catch (e) {
            if (!e.response || !e.response.data || !e.response.data.error){
                setSearchError(e.toString());
                setOpenSearchModal(false);
                return;
            }
            setSearchError(e.response.data.error);
            setOpenSearchModal(false);
            return;
        }

    }

    const removeFriend = async (e) => {
        e.preventDefault();
        
    }

    return (
        <div>
            {/*something is going weird with this modal but I honestly don't understand what*/}
            <Modal 
                open={openSearchModal}
                onClose={() => setOpenSearchModal(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className={styles.searchModal}>
                <Box className={styles.searchBox}>
                    <Grid container>
                        <Grid item xs={1}></Grid>
                        <Grid item xs={10}><h2>Search Results</h2></Grid>
                        <Grid item xs={1}><CloseIcon aria-label="close modal" className={styles.searchClose} onClick={()=> {setOpenSearchModal(false)}} /></Grid>
                    </Grid>
                    {searchResults && searchResults.length >0 && 
                    <Grid container>
                        {searchResults.map((user) => (<>
                        <Grid item xs={7}>{user.username}</Grid>
                        <Grid item xs={5}>Add Friend</Grid></>))}
                    </Grid>}
                </Box>
            </Modal>
            <h1>Friend Management</h1>
            <form onSubmit={searchUsers}>
                <TextField id="userSearch" label="Find users to add" />
                <Button type="submit">Search</Button>
            </form>
            <Grid container>
                <Grid item xs={12} md={4}>
                    <h2>My Friends</h2>
                    {friends && friends.length > 0 &&
                    <Grid container>
                        {friends.map((friend) => (<>
                        <Grid item xs={1}><PersonIcon /></Grid>
                        <Grid item xs={8.5}>{friend.username}</Grid>
                        <Grid item xs={2.5}>Unfriend</Grid></>))}
                    </Grid>}
                    {friends && friends.length <= 0 && <p>No friends to show.</p>}
                </Grid>
                <Grid item xs={12} md={4}>
                    <h2>Requests Received</h2>
                    {pendingFriends && pendingFriends.length > 0 && 
                    <Grid container>
                        {pendingFriends.map((pending) => (<>
                        {pending.pending_status === 'received' && <><Grid item xs={1}><PersonIcon /></Grid>
                        <Grid item xs={8.5}>{pending.username}</Grid>
                        <Grid item xs={2.5}>Action</Grid></>}</>))}
                    </Grid>}
                    {pendingFriends && pendingFriends.length <= 0 && <p>No requests received.</p>}
                </Grid>
                <Grid item xs={12} md={4}>
                    <h2>Requests Sent</h2>
                    {pendingFriends && pendingFriends.length > 0 && 
                    <Grid container>
                        {pendingFriends.map((pending) => (<>
                        {pending.pending_status === 'sent' && <><Grid item xs={1}><PersonIcon /></Grid>
                        <Grid item xs={8.5}>{pending.username}</Grid>
                        <Grid item xs={2.5}>Action</Grid></>}</>))}
                    </Grid>}
                    {pendingFriends && pendingFriends.length <= 0 && <p>No requests sent.</p>}
                </Grid>
            </Grid>
        </div>
    )

    
}