import React from 'react';
import { Link } from 'react-router-dom';
import { Battery, Zap, Leaf, BarChart3, Shield, Globe, TrendingUp } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Battery className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Charge24 Limited</h1>
                <p className="text-green-600 text-sm flex items-center">
                  <Zap className="h-4 w-4 mr-1" />
                  RECHARGE YOUR BRAND
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Professional Accounting Software
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Comprehensive financial management solution designed specifically for 
              <span className="text-green-600 font-semibold"> Charge24's sustainable technology business</span>
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/register"
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors flex items-center"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Start Managing Finances
              </Link>
              <Link
                to="/login"
                className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-green-50 transition-colors"
              >
                Login to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Complete Financial Management
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Track powerbank rentals, sales, advertising revenue, and all business expenses 
                with our comprehensive accounting solution
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Revenue Tracking</h3>
                <p className="text-gray-600">
                  Track income from advertisements, powerbank sales, rentals, and events
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expense Management</h3>
                <p className="text-gray-600">
                  Categorize and track all business expenses with receipt attachments
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Financial Reports</h3>
                <p className="text-gray-600">
                  Generate professional balance sheets, P&L statements, and cash flow reports
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info Section */}
        <div className="bg-green-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">About Charge24 Limited</h2>
                <p className="text-green-100 mb-6 text-lg">
                  Leading green tech company in Kenya specializing in solar-powered powerbank 
                  dispensing machines with advertising capabilities. We're revolutionizing mobile 
                  charging solutions while promoting sustainable technology.
                </p>
                <div className="flex items-center space-x-4">
                  <Leaf className="h-6 w-6" />
                  <span className="text-lg">Sustainable Technology</span>
                </div>
              </div>
              
              <div className="bg-green-500 p-8 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3 text-green-100">
                  <p className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Ngong Lane Plaza 4th Floor - Ngong Rd.
                  </p>
                  <p>📞 020 2577 111 | 📱 0792 041 626</p>
                  <p>✉️ info@charge24.ke</p>
                  <p>🌐 www.charge24.africa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;