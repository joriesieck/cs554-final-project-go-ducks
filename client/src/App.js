import { BrowserRouter as Router, Route } from 'react-router-dom';
import Head from 'next/head';
import CreateUser from './components/CreateUser/CreateUser';
import LogIn from './components/LogIn/LogIn';
import AuthContainer from './AuthContainer';
import { useDispatch } from 'react-redux';

function App() {
  const dispatch = useDispatch();

  window.addEventListener('beforeunload', (e) => {
    // on close, log user out
    dispatch({
      type: 'CLEAR_TOKEN',
    });

    dispatch({
      type: 'LOG_OUT',
    });
  });

  return (
    <>
      <Head><title>Jeopardy Trainer</title></Head>
      <Router>
        <Route exact path="/" component={LogIn} />
        <Route exact path="/create-user" component={CreateUser} />
        <Route
          path={['/home', '/profile', '/game', '/practice', '/friends', '/leaderboard']}
          component={AuthContainer}
        />
      </Router>
    </>
  );
}

export default App;
