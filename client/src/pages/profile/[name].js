import axios from 'axios';
import AuthContainer from '../../AuthContainer';
import NextNav from '../../components/Nav/NextNav';
import IndProfile from '../../components/Profile/IndProfile';
import Profile from '../../components/Profile/Profile';
import { getAllUsers, getUserByName } from '../../utils/backendCalls';
import GetAuthToken from './GetAuthToken';

let authTokenToUse;
const getAuthToken = (authToken) => {
	console.log(authToken);
	authTokenToUse = authToken;
};

export default function profileByName({ data }) {
	console.log(data);
	return (
		<>
			<NextNav />
			<IndProfile data={data} />
		</>
	)
}

export async function getStaticProps({ params }) {
	const blah = <GetAuthToken getAuthToken={getAuthToken} />;
	const data = await getProfileByUserName(params.name, authTokenToUse);
    
	return {
		props: { data, blah },
		revalidate: 2000
	};
}

async function getProfileByUserName(name, authToken) {
	const data = await getUserByName(name, authTokenToUse);
    console.log("fetched a user " + name);
	return data;
}

async function getProfilesData(authToken) {
	const data = await getAllUsers(authTokenToUse);
    console.log("fetched all users")
	return data;
}
export async function getStaticPaths() {
	console.log('authTokenToUse',authTokenToUse);
	const blah = <GetAuthToken getAuthToken={getAuthToken} />;
	let data = [];
	if (authTokenToUse) data = await getProfilesData(authTokenToUse);

	const paths = data.map((user) => {
		console.log(blah);
		return {
			params: { name: user.username }
		};
	});

	return {
		paths: paths,
		fallback: false
	};
}
