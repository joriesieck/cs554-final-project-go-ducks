import { BrowserRouter as Router, Route } from 'react-router-dom';

import CreateUser from './components/CreateUser/CreateUser';
import LogIn from './components/LogIn/LogIn';
import AuthContainer from './AuthContainer';
import '../src/components/LogIn/LogIn.module.css';

function App() {
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
