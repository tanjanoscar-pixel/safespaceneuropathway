import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

const ROLE_LABELS = {
  parent: 'Parent / Carer',
  teacher: 'Teacher',
  professional: 'Professional',
  admin: 'Administrator',
  school: 'School / Organisation',
  child: 'Child / Young Person',
}

export function PlatformLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="platform">
      <header className="platform-header">
        <div className="platform-header-inner">
          <NavLink to="/app" className="platform-brand" end>
            NeuroPathway
          </NavLink>
          <div className="platform-header-right">
            {profile && (
              <span className="platform-role-badge">
                {profile.full_name} · {ROLE_LABELS[profile.role] ?? profile.role}
              </span>
            )}
            <button type="button" className="platform-btn-ghost" onClick={() => signOut()}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="platform-main">
        <Outlet />
      </main>
    </div>
  )
}
