import { Route, Switch } from 'wouter'
import Dashboard from './pages/Dashboard'
import ProfileBuilder from './pages/ProfileBuilder'
import JobMatcher from './pages/JobMatcher'

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/profile" component={ProfileBuilder} />
      <Route path="/match" component={JobMatcher} />
    </Switch>
  )
}
