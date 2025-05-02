import { useQuery } from "@tanstack/react-query";
import { getMonitorStatus } from "@/lib/blockchain";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { data: monitorStatus } = useQuery({
    queryKey: ['/api/monitor/status'],
    queryFn: getMonitorStatus,
  });

  return (
    <header className="bg-slate-800 border-b border-gray-700 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="text-primary text-2xl font-bold">👾 Guardian AI</div>
        <div className="hidden md:flex items-center px-2 py-1 rounded bg-slate-900 text-xs text-secondary-light">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary-light mr-2 animate-pulse"></span>
          Connected to Soneium
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="hidden md:block">
          <span className="text-xs text-gray-400">LLM:</span>
          <span className="text-sm font-medium ml-1">Groq LLama3-8b</span>
        </div>
        <Button 
          className="px-3 py-1 text-sm bg-primary hover:bg-primary-dark rounded-md transition"
        >
          Connect Wallet
        </Button>
      </div>
    </header>
  );
};

export default Header;
