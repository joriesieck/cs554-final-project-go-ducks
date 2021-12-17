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
            <h1>Friends</h1>
            {friends && friends.length > 0 && 
                <ul>
                    {friends.map((friend) => (<li>{friend.username}</li>))}
                </ul>}
        </div>
    )

    
}