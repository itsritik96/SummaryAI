"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';

export default function SubscriptionStatus() {
  const { user } = useUser();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.emailAddresses[0]?.emailAddress) {
      fetchUserStatus();
    }
  }, [user]);

  const fetchUserStatus = async () => {
    try {
      const response = await axios.post('/api/getUserStatus', {
        userEmail: user?.emailAddresses[0]?.emailAddress
      });
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching user status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 animate-pulse bg-gray-100 rounded-lg">Loading...</div>;

  if (!status) return null;

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Subscription Status</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Plan:</span>
          <span className={`capitalize font-medium px-2 py-1 rounded-full text-xs ${
            status.subscriptionPlan === 'pro' 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {status.subscriptionPlan}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          <span className={`capitalize font-medium px-2 py-1 rounded-full text-xs ${
            status.subscriptionStatus === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {status.subscriptionStatus}
          </span>
        </div>
        
        {!status.isUnlimited && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">PDFs Used:</span>
              <span className="font-medium">
                {status.pdfCreditsUsed} / {status.pdfCreditsLimit}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  status.pdfCreditsUsed >= status.pdfCreditsLimit 
                    ? 'bg-red-500' 
                    : 'bg-blue-500'
                }`}
                style={{ 
                  width: `${(status.pdfCreditsUsed / status.pdfCreditsLimit) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Credits Reset:</span>
              <span>{new Date(status.creditsResetDate).toLocaleDateString('en-IN')}</span>
            </div>
          </>
        )}
        
        {status.isUnlimited && (
          <div className="text-center py-2">
            <span className="text-green-600 font-medium text-lg">✨ Unlimited PDFs</span>
          </div>
        )}
      </div>
    </div>
  );
}
