import { BrowserRouter as Router, Route } from 'react-router-dom';
import Head from 'next/head';
import CreateUser from './components/CreateUser/CreateUser';
import LogIn from './components/LogIn/LogIn';
import AuthContainer from './AuthContainer';

function App() {
  return (
    <>
      <Head><title>Jeopary Trainer</title></Head>
      <Router>
        <Route exact path="/" component={LogIn} />
        <Route exact path="/create-user" component={CreateUser} />
        <Route
          path={['/home', '/profile', '/game', '/leaderboard']}
          component={AuthContainer}
        />
      </Router>
    </>
  );
}

export default App;
