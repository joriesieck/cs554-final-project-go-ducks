import { BrowserRouter as Router, Route } from 'react-router-dom';

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
      <Router>
        <Route exact path="/" component={LogIn} />
        <Route exact path="/create-user" component={CreateUser} />
        <Route
          path={['/home', '/profile', '/game']}
          component={AuthContainer}
        />
      </Router>
    </>
  );
}

export default App;
