import { useEffect, useState } from "react";

import { 
    getUserById,
	editUserInfo,
	getUserByEmail,
	removeFriend,
	removeUser,
	removePendingFriend,
	acceptPendingFriend,
	getAllFriends,
	getAllPendingFriends
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
import { Redirect, Link } from "react-router-dom";
import { checkString } from "../../utils/inputChecks";
import { Box } from "@mui/system";

import styles from './Profile.module.css';

export default function IndProfile(props) {


    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchFriendsListById() {
            let data = {friendsList : [], name : ""};
            
                for (let friend of props.data.friends) {
                    try {
                        let friendData = await getUserById(friend);
                        data.friendsList.push(friendData);
                    } catch (e) {
                        console.log(e);
                    }
                    
                } 
                setProfileData(data);
        }
        fetchFriendsListById();
    },[]);
    console.log(profileData);
    return (
        <div className={styles.profile}>
            
            <h1>Profile</h1>
            <Grid className={styles.profileList} />
            <h2>Login Credentials</h2>
            <Grid item xs={12} className={styles.profileEditable}>
				
			</Grid>
            <div className={styles.profileList}>
			<h2>High Scores</h2>
			<Grid item className={`${styles.profile} ${styles.profileLeaderboard}`}>
				<Grid item xs={1}><LeaderboardIcon /></Grid>

			</Grid>
			
			
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

        </div>
    )
}