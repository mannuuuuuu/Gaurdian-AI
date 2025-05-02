import { useQuery } from "@tanstack/react-query";
import { getMonitorStatus } from "@/lib/blockchain";

const StatusCard = () => {
  const { data: monitorStatus, isLoading } = useQuery({
    queryKey: ['/api/monitor/status'],
    queryFn: getMonitorStatus,
  });

  const lastUpdate = new Date(); // This would typically come from a state or store
  lastUpdate.setMinutes(lastUpdate.getMinutes() - 2); // Mock last update time (2 minutes ago)
  
  const timeAgo = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000); // difference in minutes
    
    if (diff < 1) return "just now";
    if (diff === 1) return "1 minute ago";
    return `${diff} minutes ago`;
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-gray-700 shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-400 text-sm font-medium">Status</h3>
          <div className="flex items-center mt-1">
            {isLoading ? (
              <div className="h-3 w-3 bg-gray-600 rounded-full animate-pulse mr-2"></div>
            ) : (
              <span className={`inline-block w-3 h-3 rounded-full ${monitorStatus?.active ? 'bg-secondary-light' : 'bg-alert'} mr-2`}></span>
            )}
            <p className="text-xl font-semibold text-white">
              {isLoading ? "Loading..." : (monitorStatus?.active ? "Active" : "Inactive")}
            </p>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary-light/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <div className="mt-4 text-sm text-gray-400">
        Last update: <span className="text-white">{timeAgo()}</span>
      </div>
    </div>
  );
};

export default StatusCard;
