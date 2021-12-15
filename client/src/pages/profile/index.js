import Profile from '../../components/Profile/Profile';
import AuthContainer from '../../AuthContainer';
export default function profile() {
  return (
    <AuthContainer>
      <Profile />
    </AuthContainer>
  );
}
