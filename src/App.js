import {BrowserRouter as Router, Route} from 'react-router-dom';

import CreateUser from './components/CreateUser/CreateUser';
import LogIn from './components/LogIn/LogIn';
import Landing from './components/Landing/Landing';

function App() {
  return (
    <Router>
      <Route exact path='/' component={LogIn} />
      <Route exact path='/create-user' component={CreateUser} />
      <Route exact path='/home' component={Landing} />
    </Router>
  );
}

export default App;
