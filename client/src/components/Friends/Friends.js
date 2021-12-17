import {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {
    getUserByEmail,
    addFriend,
    removeFriend, 
    removePendingFriend,
    acceptPendingFriend,
    getAllFriends,
    getAllPendingFriends
} from '../../utils/backendCalls';
import {
    Grid
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

export default function Friends() {
    const [ userData, setUserData ] = useState(null);
    const [ friends, setFriends ] = useState(null);
    const [ pendingFriends, setPendingFriends] = useState(null);
    const [ error, setError ] = useState(null);

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

    return (
        <div>
            <h1>Friend Management</h1>
            <h2>Friend Searchbar Here</h2>
            <Grid container>
                <Grid item sm={12} md={6}>
                    <h2>Friends</h2>
                    {friends && friends.length > 0 &&
                    <Grid container>
                        {friends.map((friend) => (<>
                        <Grid item xs={1}><PersonIcon /></Grid>
                        <Grid item xs={8.5}>{friend.username}</Grid>
                        <Grid item xs={2.5}>Unfriend</Grid></>))}
                    </Grid>}
                    {friends && friends.length <= 0 && <p>No friends to show.</p>}
                </Grid>
                <Grid item sm={12} md={6}>
                    <h2>Pending Friends</h2>
                    {pendingFriends && pendingFriends.length > 0 && 
                    <Grid container>
                        {pendingFriends.map((pending) => (<>
                        <Grid item xs={1}><PersonIcon /></Grid>
                        <Grid item xs={8.5}>{pending.username}</Grid>
                        <Grid item xs={2.5}>Action</Grid></>))}
                    </Grid>}
                    {pendingFriends && pendingFriends.length <= 0 && <p>No pending friends to show.</p>}
                </Grid>
            </Grid>
        </div>
    )

    
}