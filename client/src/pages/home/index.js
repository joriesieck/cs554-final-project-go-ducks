import AuthContainer from '../../AuthContainer';
import Home from '../../components/Home/Home';
export default function home() {
  return (
    <AuthContainer>
      <Home />
    </AuthContainer>
  );
}
