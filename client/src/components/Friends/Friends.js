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
import CheckIcon from '@mui/icons-material/Check';
import styles from './Friends.module.css';

export default function Friends() {
    const [ userData, setUserData ] = useState(null);
    const [ searchResults, setSearchResults ] = useState(null);
    const [ friends, setFriends ] = useState(null);
    const [ pendingFriends, setPendingFriends] = useState(null);

    const [ error, setError ] = useState(null);
    const [ searchError, setSearchError ] = useState(null);
    const [ providerError, setProviderError ] = useState(null);

    const [ openSearchModal, setOpenSearchModal ] = useState(false);
    const [ openRemoveModal, setOpenRemoveModal ] = useState(false);
    const [ openRejectModal, setOpenRejectModal ] = useState(false);
    const [ openAcceptModal, setOpenAcceptModal ] = useState(false);
    const [ openUnsendModal, setOpenUnsendModal ] = useState(false);
    const [ toggleFriends, setToggleFriends ] = useState({friendId: '', friendUser: ''});
    

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

    const triggerConfirmModal = (e, action, friendId, friendUser, pendingStatus) => {
        setToggleFriends({friendId, friendUser});
        if (action === 'remove'){
            setOpenRemoveModal(true);
        } else if (action === 'reject'){
            setOpenRejectModal(true);
        } else if (action === 'accept'){
            setOpenAcceptModal(true);
        } else if (action === 'unsend'){
            setOpenUnsendModal(true);
        }
    }

    const triggerRemoveFriend = async (e) => {
		e.preventDefault();
		let friendToRemove = toggleFriends.friendUser;
		let result;
		try {
			friendToRemove = checkString(friendToRemove, 'friendToRemove', true, false);
			result = await removeFriend(userData.username, friendToRemove);
			// remove them on the front end too
			const friends = await getAllFriends(result.username);
			setFriends(friends);
            userData.friends = friends;
		} catch (e) {
			if (!e.response || !e.response.data || !e.response.data.error) {
				setProviderError((e.toString()));
			setOpenRemoveModal(false);
			return;
			}
			setProviderError(e.response.data.error);
			setOpenRemoveModal(false);
			return;
		}
		setOpenRemoveModal(false);
	}
    const triggerRemovePendingFriend = async (e) => {
		e.preventDefault();
		let pendingToRemove = toggleFriends.friendUser;
		let result;
		try {
			pendingToRemove = checkString(pendingToRemove, 'pendingToRemove', true, false);
			result = await removePendingFriend(userData.username, pendingToRemove);
			// remove them on the front end too
			const pendingFriends = await getAllPendingFriends(result.username);
			setPendingFriends(pendingFriends);
            userData.pending_friends = pendingFriends;
		} catch (e) {
			if (!e.response || !e.response.data || !e.response.data.error) {
				setProviderError((e.toString()));
				setOpenRejectModal(false);
                setOpenUnsendModal(false);
				return;
			}
			setProviderError(e.response.data.error);
			setOpenRejectModal(false);
            setOpenUnsendModal(false);
			return;
		}
		setOpenRejectModal(false);
        setOpenUnsendModal(false);
	}

    const triggerAddPendingFriend = async (e) => {
		e.preventDefault();
		let friendToAccept = toggleFriends.friendUser;
		let result;
		try {
			friendToAccept = checkString(friendToAccept, 'friendToAccept', true, false);
			result = await acceptPendingFriend(userData.username, friendToAccept);
			// add them on the front end too
			const friends = await getAllFriends(result.username);
			const pendingFriends = await getAllPendingFriends(result.username);
            setFriends(friends);
			userData.pending_friends = pendingFriends;
            setPendingFriends(pendingFriends);
			userData.friends = friends;
		} catch (e) {
			if (!e.response || !e.response.data || !e.response.data.error) {
				setProviderError((e.toString()));
				setOpenAcceptModal(false);
				return;
			}
			setProviderError(e.response.data.error);
			setOpenAcceptModal(false);
			return;
		}
		setOpenAcceptModal(false);
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
                    <Grid container className={styles.searchHeader}>
                        <Grid item xs={1}></Grid>
                        <Grid item xs={10}><h2>Search Results</h2></Grid>
                        <Grid item xs={1}><CloseIcon aria-label="close modal" className={styles.friendsClose} onClick={()=> {setOpenSearchModal(false)}} /></Grid>
                    </Grid>
                    {searchResults && searchResults.length >0 && 
                    <Grid container>
                        {searchResults.map((user) => (<>
                        <Grid item xs={7}>{user.username}</Grid>
                        <Grid item xs={5}>Add Friend</Grid></>))} {/*Add friend text should depend on if user has friend already*/}
                    </Grid>}
                    {searchResults && searchResults.length <= 0 && 
                    <p>Sorry we couldn't find any users with that name</p>}
                </Box>
            </Modal>
            <Modal
				open={openRemoveModal}
				onClose={() => {setOpenRemoveModal(false)}}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
				className={styles.friendsModal}>
				<Box className={styles.friendsBox}>
					<Grid container>
						<Grid item xs={1}></Grid>
						<Grid item xs={10}><h1 id="modal-modal-title">Confirm</h1></Grid>
						<Grid item xs={1}><CloseIcon aria-label='close modal' className={styles.friendsClose} onClick={() => {setOpenRemoveModal(false)}} /></Grid>
					</Grid>

					<p id="modal-modal-description">Are you sure you want to remove {toggleFriends.friendUser} as a friend?</p>
					
					<Button variant='contained' onClick={triggerRemoveFriend}>Yes, unfriend</Button>
					<Button onClick={() => {setOpenRemoveModal(false)}}>No, stay friends</Button>
				</Box>
			</Modal>
            <Modal
				open={openAcceptModal}
				onClose={() => {setOpenAcceptModal(false)}}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
				className={styles.friendsModal}>
				<Box className={styles.friendsBox}>
					<Grid container>
						<Grid item xs={1}></Grid>
						<Grid item xs={10}><h1 id="modal-modal-title">Confirm</h1></Grid>
						<Grid item xs={1}><CloseIcon aria-label='close modal' className={styles.friendsClose} onClick={() => {setOpenAcceptModal(false)}} /></Grid>
					</Grid>

					<p id="modal-modal-description">Are you sure you want to add {toggleFriends.friendUser} as a friend?</p>
					
					<Button variant='contained' onClick={triggerAddPendingFriend}>Yes, add friend</Button>
					<Button onClick={() => {setOpenAcceptModal(false)}}>No, do nothing</Button>
				</Box>
			</Modal>
            <Modal
				open={openRejectModal}
				onClose={() => {setOpenRejectModal(false)}}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
				className={styles.friendsModal}
			>
				<Box className={styles.friendsBox}>
					<Grid container>
						<Grid item xs={1}></Grid>
						<Grid item xs={10}><h1 id="modal-modal-title">Confirm</h1></Grid>
						<Grid item xs={1}><CloseIcon aria-label='close modal' className={styles.friendsClose} onClick={() => {setOpenRejectModal(false)}} /></Grid>
					</Grid>

					<p id="modal-modal-description">Are you sure you want to reject {toggleFriends.friendUser} as a friend?</p>
					
					<Button variant='contained' onClick={triggerRemovePendingFriend}>Yes, reject</Button>
					<Button onClick={() => {setOpenRejectModal(false)}}>No, do nothing</Button>
				</Box>
			</Modal>
            <Modal
				open={openUnsendModal}
				onClose={() => {setOpenUnsendModal(false)}}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
				className={styles.friendsModal}>
				<Box className={styles.friendsBox}>
					<Grid container>
						<Grid item xs={1}></Grid>
						<Grid item xs={10}><h1 id="modal-modal-title">Confirm</h1></Grid>
						<Grid item xs={1}><CloseIcon aria-label='close modal' className={styles.friendsClose} onClick={() => {setOpenUnsendModal(false)}} /></Grid>
					</Grid>

					<p id="modal-modal-description">Are you sure you want to cancel your request to {toggleFriends.friendUser}?</p>
					
					<Button variant='contained' onClick={triggerRemovePendingFriend}>Yes, cancel</Button>
					<Button onClick={() => {setOpenUnsendModal(false)}}>No, do nothing</Button>
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
                        <Grid item xs={2.5}>
                            <Button color="error" onClick={(e) => {triggerConfirmModal(e, 'remove', friend._id, friend.username)}}>Unfriend</Button>
                        </Grid></>))}
                    </Grid>}
                    {friends && friends.length <= 0 && <p>No friends to show.</p>}
                </Grid>
                <Grid item xs={12} md={4}>
                    <h2>Requests Received</h2>
                    {pendingFriends && pendingFriends.length > 0 && 
                    <Grid container>
                        {pendingFriends.map((pending) => (<>
                        {pending.pending_status === 'received' && <><Grid item xs={1}><PersonIcon /></Grid>
                        <Grid item xs={8}>{pending.username}</Grid>
                        <Grid item xs={1.5}>
                            <Button onClick={(e) => {triggerConfirmModal(e,'accept',pending._id, pending.username)}}><CheckIcon aria-label='accept friend' onClick={(e) => {triggerConfirmModal(e,'accept',pending._id, pending.username)}} /></Button>
                        </Grid>
                            <Button color="error" onClick={(e) => {triggerConfirmModal(e,'reject',pending._id, pending.username)}}><CloseIcon aria-label='reject friend' onClick={(e) => {triggerConfirmModal(e,'reject',pending._id, pending.username)}} /></Button>
                        </>}</>))}
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
                        <Grid item xs={2.5}>
                            <Button color="error" onClick={(e) => {triggerConfirmModal(e, 'unsend', pending._id, pending.username, pending.pending_status)}}>Unsend</Button>
                        </Grid></>}</>))}
                    </Grid>}
                    {pendingFriends && pendingFriends.length <= 0 && <p>No requests sent.</p>}
                </Grid>
            </Grid>
        </div>
    )

    
}