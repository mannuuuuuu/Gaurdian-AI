import { useQuery } from "@tanstack/react-query";
import { getActiveAlerts } from "@/lib/blockchain";
import { formatSeverity } from "@/lib/groq";
import { Button } from "@/components/ui/button";
import { Alert } from "@shared/schema";

interface AIAlertPanelProps {
  fullSize?: boolean;
}

const AIAlertPanel = ({ fullSize = false }: AIAlertPanelProps) => {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/alerts/active'],
    queryFn: getActiveAlerts
  });

  return (
    <div className="bg-slate-800 rounded-lg border border-gray-700 shadow-md">
      <div className="border-b border-gray-700 px-4 py-3 flex justify-between items-center">
        <h2 className="font-medium">AI Analysis</h2>
        <button className="text-xs text-primary hover:text-primary-light">
          View Details
        </button>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.slice(0, fullSize ? alerts.length : 3).map((alert: Alert) => {
              const severity = formatSeverity(alert.severity);
              
              return (
                <div 
                  key={alert.id} 
                  className={`${severity.bgColor} border ${severity.borderColor} rounded-md p-3`}
                >
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${severity.color} mr-2 mt-0.5 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className={`${severity.color} font-medium text-sm`}>{alert.title}</h3>
                      <p className="text-gray-300 text-xs mt-1">
                        {alert.description.length > 150 
                          ? `${alert.description.substring(0, 150)}...` 
                          : alert.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button 
                      variant="ghost"
                      className={`text-xs text-white px-2 py-1 rounded ${severity.buttonBg}`}
                    >
                      {alert.severity === 'HIGH' ? 'Review Now' : 'Investigate'}
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {/* Add recommendation item if less than 3 alerts */}
            {alerts.length < 3 && (
              <div className="bg-primary-dark/20 border border-primary-dark/30 rounded-md p-3">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-light mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-primary-light font-medium text-sm">AI Recommendation</h3>
                    <p className="text-gray-300 text-xs mt-1">
                      Consider implementing a time-delay mechanism for sensitive Guardian DAO operations to allow for proper review before execution.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-sm">No active alerts</p>
            <p className="text-xs mt-1">All monitored contracts appear to be secure</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAlertPanel;
