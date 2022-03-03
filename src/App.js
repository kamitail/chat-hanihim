import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import React from 'react';
import SignUp from './views/SignUp';
import Home from './views/Home';
import LogIn from './views/LogIn';
import { UserProvider } from './contexts/UserContext';

export default function App() {
  return (
    <Router>
      <UserProvider>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/signup" exact component={SignUp} />
            <Route path="/login" exact component={LogIn} />
          </Switch>
      </UserProvider>
    </Router>
  )
}

