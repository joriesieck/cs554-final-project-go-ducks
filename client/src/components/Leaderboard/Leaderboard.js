import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button,Grid } from "@mui/material";
import SportsScore from "@mui/icons-material/SportsScore";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import styles from './Leaderboard.module.css';
import { useEffect, useState } from "react";
import { addFriend, getUserByEmail } from "../../utils/backendCalls";
import { checkString } from "../../utils/inputChecks";

const leaderboardData = [
	{
		username: 'exampleuser',
		highScore: 100,
		_id: '61b3d95ad4b9d4bbbd918d58'
	},
	{
		username: 'user1',
		highScore: 90,
		_id: '61b3db73ae7f82380c058acf'
	},
	{
		username: 'user3',
		highScore: 95,
		_id: '61b4a7930b1fa59502af8372'
	},
	{
		username: 'jorie',
		highScore: 80,
		_id: '61b7ed0faa5411ee4b635f68'
	}
]

// const leaderboardData = [];

export default function Leaderboard () {
	// TODO hook in back end
	// TODO add friend
	const user = useSelector((state) => state.user);	// highlight user
	const [userData, setUserData] = useState(null);
	const [error, setError] = useState(null);
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

	const triggerAddFriend = async (e, username) => {
		e.preventDefault();
		try {
			checkString(username, 'Username', true, false);
			const result = await addFriend(userData.username, username);
			userData.friends = result.friends;
		} catch (e) {
			if (!e.response || !e.response.data || !e.response.data.error) {
				setError((e.toString()));
				return;
			}
			setError(e.response.data.error);
			return;
		}
	}

	return (
		<div className={styles.leaderboard}>
			<h1>Leaderboard</h1>
			{(leaderboardData.length>0 && userData) && <Grid container xs={12} className={styles.gridContainer}>
				{leaderboardData.map(({username, highScore, _id}, i) => {
					let place;
					if (i===0) place = 'firstPlace';
					else if (i===1) place = 'secondPlace';
					else if (i===2) place = 'thirdPlace';
					const friends = userData.friends.includes(_id);
					return (<Grid container xs={12} className={`${styles.gridRow}${username===userData.username ? ` ${styles.currentUser}` : ''}`}>
						<Grid item xs={1} className={styles[place]}>{i<=2 ? <EmojiEventsIcon /> : <LeaderboardIcon />}</Grid>
						<Grid item xs={1}>{i+1}</Grid>
						<Grid item xs={5}>{username}</Grid>
						<Grid item xs={4}>{highScore}</Grid>
						{friends && <Grid item xs={1}><GroupIcon /></Grid>}
						{/* <Grid item xs={2} className={styles.friendIcons}>{friends ? <GroupIcon /> : <Button onClick={(e) => {triggerAddFriend(e, username)}}><PersonAddIcon onClick={(e) => {triggerAddFriend(e, username)}} /></Button>}</Grid> */}
					</Grid>)})}
			</Grid>}
			
			{leaderboardData.length<=0 && <p>Looks like there aren't any users on the leaderboard yet. <Link to='/game'>Play a game</Link> to kick it off!</p>}

			{error && <Alert severity="error">{error}</Alert>}
		</div>
	)
}