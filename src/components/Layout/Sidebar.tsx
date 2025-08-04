import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  FileText, 
  BarChart3, 
  DollarSign,
  Target,
  Activity
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Petty Cash', href: '/petty-cash', icon: Wallet },
  { name: 'Expenses', href: '/expenses', icon: TrendingDown },
  { name: 'Income', href: '/income', icon: TrendingUp },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Analytics', href: '/analytics', icon: Activity },
  { name: 'Balance Sheet', href: '/balance-sheet', icon: FileText },
  { name: 'Profit & Loss', href: '/profit-loss', icon: BarChart3 },
  { name: 'Cash Flow', href: '/cash-flow', icon: DollarSign },
];

const Sidebar: React.FC = () => {
  return (
    <div className="bg-white shadow-lg w-64 min-h-screen">
      <nav className="mt-8">
        <div className="px-4">
          <h2 className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-4">
            Accounting Modules
          </h2>
        </div>
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors ${
                  isActive
                    ? 'bg-green-100 text-green-700 border-r-4 border-green-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 bg-gray-50 border-t">
        <div className="text-xs text-gray-500">
          <p className="font-semibold">Charge24 Limited</p>
          <p>Ngong Lane Plaza 4th Floor</p>
          <p>020 2577 111 | 0792 041 626</p>
          <p>info@charge24.ke</p>
          <p>www.charge24.africa</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;