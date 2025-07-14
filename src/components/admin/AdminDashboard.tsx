import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Download, 
  Search, 
  Filter, 
  RefreshCw, 
  Mail, 
  Calendar, 
  Package, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { getAllUsers, getUserStatistics, User } from '../lib/supabase';
import EmailServiceTester from './EmailServiceTester';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof User>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterPlan, setFilterPlan] = useState<string | null>(null);
  const [showEmailTester, setShowEmailTester] = useState(false);
  
  const usersPerPage = 10;

  {/* Statistics */}
  {statistics && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center space-x-4">
          <Users className="w-8 h-8 text-purple-600" />
          <div>
            <h3 className="text-sm text-slate-500">Total Users</h3>
            <p className="text-2xl font-semibold">{statistics.totalUsers}</p>
          </div>
        </div>
      </div>
    </div>
  )}
}