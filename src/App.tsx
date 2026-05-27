import { Route, Switch } from 'wouter'
import Dashboard from './pages/Dashboard'
import ProfileBuilder from './pages/ProfileBuilder'
import JobMatcher from './pages/JobMatcher'
import AuthCallback from './pages/AuthCallback'   // ← Nueva página

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/profile" component={ProfileBuilder} />
      <Route path="/match" component={JobMatcher} />
      <Route path="/auth/callback" component={AuthCallback} />   {/* Nueva ruta */}
      {/* Captura cualquier ruta con hash (importante para Supabase) */}
      <Route path="/profile" component={ProfileBuilder} />
    </Switch>
  )
}
