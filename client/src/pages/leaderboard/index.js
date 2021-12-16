import Leaderboard from "../../components/Leaderboard/Leaderboard";
import AuthContainer from "../../AuthContainer";

export default function leaderboard() {
	return (
		<AuthContainer>
			<Leaderboard />
		</AuthContainer>
	)
}