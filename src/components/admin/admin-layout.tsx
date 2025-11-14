import Link from 'next/link'
import { UserCircle, Users, FileText, Shield, BarChart3, Activity } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: BarChart3,
    },
    {
      name: 'Faculty Requests',
      href: '/admin/faculty-requests',
      icon: UserCircle,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      soon: true,
    },
    {
      name: 'Content',
      href: '/admin/content',
      icon: FileText,
      soon: true,
    },
    {
      name: 'Security',
      href: '/admin/security',
      icon: Shield,
      soon: true,
    },
    {
      name: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: Activity,
      soon: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-neural-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Link
              href="/"
              className="text-sm hover:underline opacity-90 hover:opacity-100"
            >
              Back to Platform
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1 sticky top-8">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      item.soon
                        ? 'text-muted-foreground cursor-not-allowed opacity-50'
                        : 'hover:bg-neural-light/10 text-foreground'
                    }`}
                    onClick={(e) => {
                      if (item.soon) e.preventDefault()
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.soon && (
                      <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">
                        Soon
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
