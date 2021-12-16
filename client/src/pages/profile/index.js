import Profile from '../../components/Profile/Profile';
import AuthContainer from '../../AuthContainer';
import { getAllUsers, getUserByName } from '../../utils/backendCalls';
import axios from 'axios';

export default function profile() {
  return (
    <AuthContainer>
      <Profile />
    </AuthContainer>
  );
}

async function getProfilesData() {
  console.log("getting profiles")
	const data = await getAllUsers();
  console.log(data);
	return data;
}
export async function getStaticProps() {
	const data = await getProfilesData();
	return {
		props: { data },
		revalidate: 86400
	};
}