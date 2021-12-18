import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FormControlLabel,Grid, Switch, Alert } from "@mui/material";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import GroupIcon from '@mui/icons-material/Group';
import styles from './FriendsLeaderboard.module.css';
import { useEffect, useState } from "react";
import { getLeaderboard, getUserByEmail } from "../../utils/backendCalls";

export default function FriendLeaderboard () {
	const user = useSelector((state) => state.user);	// highlight user
	const [userData, setUserData] = useState(null);
	const [error, setError] = useState(null);
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

	let friendsLB = leaderboardData && leaderboardData.filter((elem) => (elem.username === userData.username || userData.friends.includes(elem._id)));
	console.log(friendsLB)
	return (
		<div className={styles.leaderboard}>
			<h2>Friends Leaderboard</h2>
			{(leaderboardData && friendsLB.length>0 && userData) && 
			<>
			<Grid container xs={12} className={styles.gridContainer}>
				{friendsLB.map(({username, score }, i) => {
					const isSelf = username===userData.username;
					let place;
					console.log(isSelf)
					if (i===0) place = 'firstPlace';
					else if (i===1) place = 'secondPlace';
					else if (i===2) place = 'thirdPlace';
					return (<Grid container xs={12} className={`${styles.gridRow}${isSelf ? ` ${styles.currentUser}` : ''}`}>
						<Grid item xs={1} className={styles[place]}>{i<=2 ? <EmojiEventsIcon /> : <LeaderboardIcon />}</Grid>
						<Grid item xs={1}>{i+1}</Grid>
						<Grid item xs={5}>{username}</Grid>
						<Grid item xs={4}>{score}</Grid>
					</Grid>)})}
			</Grid>
			</>}
			
			{leaderboardData && friendsLB.length<=0 && <p>Looks like you and your friends aren't on the leaderboard yet. <Link to='/game'>Play a game</Link> to kick it off!</p>}

			{error && <Alert severity="error">{error}</Alert>}
		</div>
	)
}