import AuthContainer from '../../AuthContainer';
import Friends from '../../components/Friends/Friends';
export default function friends() {
  return (
    <AuthContainer>
      <Friends />
    </AuthContainer>
  );
}
