import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { LogOut, Battery, Zap } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { migrateLocalStorageData } = useData();

  React.useEffect(() => {
    if (user) {
      migrateLocalStorageData();
    }
  }, [user, migrateLocalStorageData]);

  return (
    <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-white p-2 rounded-lg">
                <Battery className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Charge24 Limited</h1>
                <p className="text-green-100 text-sm flex items-center">
                  <Zap className="h-4 w-4 mr-1" />
                  RECHARGE YOUR BRAND
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">{user?.user_metadata?.full_name || user?.email}</p>
              <p className="text-green-100 text-sm">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;