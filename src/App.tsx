import { Route, Switch } from 'wouter'
import Dashboard from './pages/Dashboard'
import ProfileBuilder from './pages/ProfileBuilder'
import JobMatcher from './pages/JobMatcher'
import AuthCallback from './pages/AuthCallback'   // ← Nueva importación

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/profile" component={ProfileBuilder} />
      <Route path="/match" component={JobMatcher} />
      <Route path="/auth/callback" component={AuthCallback} />
      
      {/* Fallback por si hay problemas con el hash */}
      <Route path="/profile" component={ProfileBuilder} />
    </Switch>
  )
}
