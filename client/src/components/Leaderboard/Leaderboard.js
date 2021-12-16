import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FormControlLabel,Grid, Switch } from "@mui/material";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import GroupIcon from '@mui/icons-material/Group';
import styles from './Leaderboard.module.css';
import { useEffect, useState } from "react";
import { getLeaderboard, getUserByEmail } from "../../utils/backendCalls";

export default function Leaderboard () {
	const user = useSelector((state) => state.user);	// highlight user
	const [userData, setUserData] = useState(null);
	const [error, setError] = useState(null);
	const [friendsOnly, setFriendsOnly] = useState(false);
	const [leaderboardData, setLeaderboardData] = useState([]);

	useEffect(() => {
		async function fetchData() {
			let data;
			try {
				data = await getUserByEmail(user);
			} catch (e) {
				if (!e.response || !e.response.data || !e.response.data.error) {
					setError((e.toString()));
					return;
				}
				setError(e.response.data.error);
				return;
			}
			setUserData(data);
		}
		fetchData();
	}, []);

	useEffect(() => {
		async function fetchData() {
			let data;
			try {
				data = await getLeaderboard();
			} catch (e) {
				if (!e.response || !e.response.data || !e.response.data.error) {
					setError((e.toString()));
					return;
				}
				setError(e.response.data.error);
				return;
			}
			console.log(data);
			setLeaderboardData(data.leaderboard);
		}
		fetchData();
	}, []);

	return (
		<div className={styles.leaderboard}>
			<h1>Leaderboard</h1>
			{(leaderboardData.length>0 && userData) && 
			<>
			<Grid container className={styles.gridRow}>
				<Grid item xs={7}>{friendsOnly ? 'Showing only friends' : 'Showing all players'}</Grid>
				<Grid item xs={5}><FormControlLabel control={<Switch
					onChange={() => {setFriendsOnly(!friendsOnly)}}
					inputProps={{'aria-label': 'controlled'}}
				/>} label='Show only friends' /></Grid>
			</Grid>
			<Grid container xs={12} className={styles.gridContainer}>
				{leaderboardData.map(({username, score, _id}, i) => {
					const friends = userData.friends.includes(_id);
					const isSelf = username===userData.username;
					if (friendsOnly && (!friends && !isSelf)) return;
					let place;
					if (i===0) place = 'firstPlace';
					else if (i===1) place = 'secondPlace';
					else if (i===2) place = 'thirdPlace';
					return (<Grid container xs={12} className={`${styles.gridRow}${isSelf ? ` ${styles.currentUser}` : ''}`}>
						<Grid item xs={1} className={styles[place]}>{i<=2 ? <EmojiEventsIcon /> : <LeaderboardIcon />}</Grid>
						<Grid item xs={1}>{i+1}</Grid>
						<Grid item xs={5}>{username}</Grid>
						<Grid item xs={4}>{score}</Grid>
						{friends && <Grid item xs={1}><GroupIcon /></Grid>}
					</Grid>)})}
			</Grid>
			</>}
			
			{leaderboardData.length<=0 && <p>Looks like there aren't any users on the leaderboard yet. <Link to='/game'>Play a game</Link> to kick it off!</p>}

			{error && <Alert severity="error">{error}</Alert>}
		</div>
	)
}