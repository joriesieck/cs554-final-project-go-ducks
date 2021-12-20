import { useSelector } from "react-redux";
export default function GetAuthToken (props) {
	const authToken = useSelector((state) => state.auth.authToken);
	props.getAuthToken(authToken);
	return authToken;
}