import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '@/lib/analytics'

/**
 * Tracks page views on every route change for GA4.
 * Mount once inside <BrowserRouter>.
 */
export function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  return null
}
