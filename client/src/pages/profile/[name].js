import axios from 'axios';
import AuthContainer from '../../AuthContainer';
import NextNav from '../../components/Nav/NextNav';
import IndProfile from '../../components/Profile/IndProfile';
import Profile from '../../components/Profile/Profile';
import { getAllUsers, getUserByName } from '../../utils/backendCalls';
import { useSelector } from 'react-redux';

export default function profileByName({ data }) {
  console.log(data);
  return (
    <>
      <NextNav />
      <IndProfile data={data} />
    </>
  );
}

export async function getStaticProps({ params }) {
  const data = await getProfileByUserName(params.name);

  return {
    props: { data },
    revalidate: 2000,
  };
}

async function getProfileByUserName(name) {
  const data = await getUserByName(name);
  console.log('fetched a user ' + name);
  return data;
}

async function getProfilesData() {
  const data = await getAllUsers();
  console.log('fetched all users');
  return data;
}
export async function getStaticPaths() {
  const data = await getProfilesData();

  const paths = data.map((user) => {
    return {
      params: { name: user.username },
    };
  });

  return {
    paths: paths,
    fallback: false,
  };
}
