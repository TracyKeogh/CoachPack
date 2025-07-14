@@ .. @@
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
+import EmailServiceTester from './EmailServiceTester';
 
 const AdminDashboard: React.FC = () => {
   const [users, setUsers] = useState<User[]>([]);
@@ .. @@
   const [sortField, setSortField] = useState<keyof User>('created_at');
   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
   const [filterPlan, setFilterPlan] = useState<string | null>(null);
+  const [showEmailTester, setShowEmailTester] = useState(false);
   
   const usersPerPage = 10;
 
@@ .. @@
           <button
             onClick={handleRefresh}
             disabled={isLoading}
-            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
+            className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
           >
             <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
             <span>Refresh</span>
           </button>
+          <button
+            onClick={() => setShowEmailTester(!showEmailTester)}
+            className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
+          >
+            <Mail className="w-4 h-4" />
+            <span>{showEmailTester ? 'Hide Email Tester' : 'Email Tester'}</span>
+          </button>
           <button
             onClick={exportCSV}
             className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
@@ .. @@
         </div>
       </div>
 
+      {/* Email Service Tester */}
+      {showEmailTester && (
+        <EmailServiceTester />
+      )}
+
       {/* Statistics */}
       {statistics && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">