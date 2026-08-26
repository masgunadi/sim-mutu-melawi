import { NavLink } from 'react-router-dom'
import { navItems } from './navItems'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">SIM Mutu Melawi</div>
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              'sidebar__link' + (isActive ? ' sidebar__link--active' : '')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
