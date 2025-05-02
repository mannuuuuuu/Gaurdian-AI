import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import StatusCard from "@/components/dashboard/StatusCard";
import ContractWatchlist from "@/components/dashboard/ContractWatchlist";
import AIAlertPanel from "@/components/dashboard/AIAlertPanel";
import EventLog from "@/components/dashboard/EventLog";
import { getContracts, getActiveAlerts, getAiUsage, analyzeContract } from "@/lib/blockchain";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  
  const { data: contracts } = useQuery({
    queryKey: ['/api/contracts'],
    queryFn: getContracts
  });
  
  const { data: alerts } = useQuery({
    queryKey: ['/api/alerts/active'],
    queryFn: getActiveAlerts
  });
  
  const { data: aiUsage } = useQuery({
    queryKey: ['/api/ai/usage'],
    queryFn: getAiUsage
  });

  const handleRefresh = () => {
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
    queryClient.invalidateQueries({ queryKey: ['/api/alerts/active'] });
    queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    queryClient.invalidateQueries({ queryKey: ['/api/ai/usage'] });
    
    toast({
      title: "Refreshed",
      description: "Dashboard data has been refreshed",
      duration: 2000,
    });
  };
  
  const handleScan = async () => {
    if (!contracts || contracts.length === 0) return;
    
    setIsScanning(true);
    toast({
      title: "Scan initiated",
      description: "Analyzing smart contracts with AI...",
      duration: 2000,
    });
    
    try {
      // Run analysis on a random contract (just for demo purposes)
      const randomContract = contracts[Math.floor(Math.random() * contracts.length)];
      await analyzeContract(randomContract.id);
      
      toast({
        title: "Scan completed",
        description: `${randomContract.name} contract has been analyzed`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Scan failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        duration: 3000,
      });
    } finally {
      setIsScanning(false);
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/alerts/active'] });
    }
  };

  return (
    <div className="bg-slate-900 text-gray-100 min-h-screen font-sans flex flex-col">
      <Header />
      
      <div className="flex flex-grow overflow-hidden">
        <Sidebar />
        
        <main className="flex-grow flex flex-col h-full overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-white">Monitoring Dashboard</h1>
              <p className="text-sm text-gray-400 mt-1">Real-time smart contract guardian on Soneium network</p>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <Button
                onClick={handleRefresh}
                className="flex items-center px-3 py-1.5 bg-secondary hover:bg-secondary-dark text-white rounded-md text-sm transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="flex items-center px-3 py-1.5 bg-accent hover:bg-accent-dark text-white rounded-md text-sm transition ml-2"
              >
                {isScanning ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-1"></div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    New Scan
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex-grow overflow-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatusCard />
              
              <div className="bg-slate-800 rounded-lg p-4 border border-gray-700 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium">Monitored Contracts</h3>
                    <p className="text-xl font-semibold text-white mt-1">{contracts?.length || 0}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <span className="text-secondary">+1</span>
                  <span className="text-gray-400 ml-1">from last week</span>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4 border border-gray-700 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium">Active Alerts</h3>
                    <p className="text-xl font-semibold text-white mt-1">{alerts?.length || 0}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-alert/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-1 text-xs">
                  <div className="bg-red-900/30 text-alert-light rounded px-2 py-1 text-center">
                    {alerts?.filter(a => a.severity === 'HIGH').length || 0} High
                  </div>
                  <div className="bg-yellow-900/30 text-accent-light rounded px-2 py-1 text-center">
                    {alerts?.filter(a => a.severity === 'MEDIUM').length || 0} Medium
                  </div>
                  <div className="bg-blue-900/30 text-blue-300 rounded px-2 py-1 text-center">
                    {alerts?.filter(a => a.severity === 'LOW').length || 0} Low
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4 border border-gray-700 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium">AI Analysis</h3>
                    <p className="text-xl font-semibold text-white mt-1">{aiUsage?.used || 0} Queries</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${aiUsage?.percentage || 0}%` }}></div>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {aiUsage?.percentage.toFixed(1) || 0}% of daily quota
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <ContractWatchlist />
              <AIAlertPanel />
            </div>
            
            <EventLog />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
