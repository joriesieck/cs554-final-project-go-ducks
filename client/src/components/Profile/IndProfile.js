import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { 
    getUserById,
	editUserInfo,
	getUserByEmail,
	removeFriend,
	removeUser,
	removePendingFriend,
	acceptPendingFriend,
	getAllFriends,
	getAllPendingFriends,
    getUserByName
} from '../../utils/backendCalls';

import {
  Alert,
  Button,
  CircularProgress,
  Checkbox,
  Grid,
  Modal,
  TextField,
  FormControlLabel
} from '@mui/material'; 
import PersonIcon from '@mui/icons-material/Person';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import CheckIcon from '@mui/icons-material/Check';
import { useSelector, useDispatch } from "react-redux";
// import { Link } from "react-router-dom";
import Link from 'next/link'
import { checkString } from "../../utils/inputChecks";
import { Box } from "@mui/system";

import styles from './Profile.module.css';
import AuthContainer from "../../AuthContainer";


export default function IndProfile(props) {
    console.log(props);
    const router = useRouter();
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);
    const authToken = useSelector((state) => state.auth.authToken);
    
    useEffect(() => {
        async function fetchFriendsListById() {
            try {
                let userByName;
                
                userByName = (props.data) ? await getUserByName(props.data.username, authToken) : await getUserByName(props.match.params.name, authToken)
                
                console.log(userByName);
            
                let data = {friendsList : [], name : "", highScores : []};

                if (props) {
                    for (let friend of userByName.friends) {
                        try {
                            let friendData = await getUserById(friend);
                            console.log(friendData);
                            data.friendsList.push(friendData);
        
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    
                    for (let highScore of userByName.high_scores) {
                        data.highScores.push(highScore);
                    }
                    data.username = userByName.username;
                    setProfileData(data);
                }
            } catch (e) {
                console.log(e);
            }
        }
        fetchFriendsListById();
    },[]);

    const goHome = () => {
        window.location.href = '/home';
        // window.location.reload();
    }

    if (profileData) {
        return (

            <div className={styles.profile}>
                
                <h1>{profileData.username}'s Profile</h1>
                
                <div className={styles.profileList}>
                <h2>High Scores</h2>
                {profileData.highScores.length>0 && <Grid container>
                {profileData.highScores.map((score, i) => (<>
                    <Grid item className={styles.gridRow} xs={1}><SportsScoreIcon /></Grid>
                    <Grid item className={styles.gridRow} xs={11}>{score}</Grid>
                    </>))}
                </Grid>}
                {profileData.highScores.length <= 0 && <p>No high scores to show.</p>}
                
                </div>
                <div className={styles.profileList}>
                <h2>Friends</h2>
                
                {profileData.friendsList.length > 0 ? (<Grid container>
                    {profileData.friendsList.map(({_id, username}, i) => (
                        <>
                            <Grid item xs={1} className={styles.gridRow}><PersonIcon className={styles.personIcon} /></Grid>
                            <Grid item xs={8.5} className={styles.gridRow}>{username}</Grid>
                            <Grid item xs={2.5} className={styles.gridRow}>
    
                            </Grid>
                        </>
                    ))}
                </Grid>) : <p>No friends to show.</p> }
                </div>
            <Button onClick={goHome}>Home</Button>
            </div>

        )
    } else {
        return (<h1>loading</h1>)
    }
    

}