import { useQuery } from "@tanstack/react-query";
import { getMonitorStatus } from "@/lib/blockchain";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  
  const { data: monitorStatus } = useQuery({
    queryKey: ['/api/monitor/status'],
    queryFn: getMonitorStatus,
  });

  const connectWallet = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      const randomAddress = "0x" + Array.from({length: 40}, () => 
        "0123456789ABCDEF"[Math.floor(Math.random() * 16)]
      ).join('');
      
      setWalletAddress(randomAddress);
      setWalletConnected(true);
      setIsConnecting(false);
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${randomAddress.substring(0, 6)}...${randomAddress.substring(38)}`,
        duration: 3000,
      });
    }, 1500);
  };
  
  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress("");
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
      duration: 3000,
    });
  };

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
        
        {walletConnected ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="px-3 py-1 text-sm bg-secondary hover:bg-secondary-dark rounded-md transition"
              >
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Connected Wallet</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Your wallet is currently connected to Guardian AI
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <div className="bg-slate-900 p-3 rounded-md flex justify-between items-center mb-4">
                  <span className="text-gray-400 text-sm">Address:</span>
                  <span className="font-mono text-secondary-light text-sm">{walletAddress}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-md flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Network:</span>
                  <span className="text-white text-sm">Soneium Mainnet</span>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button 
                    variant="outline" 
                    className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    Close
                  </Button>
                </DialogClose>
                <Button 
                  variant="destructive"
                  onClick={disconnectWallet}
                >
                  Disconnect
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button 
            className="px-3 py-1 text-sm bg-primary hover:bg-primary-dark rounded-md transition flex items-center"
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Connecting...
              </>
            ) : (
              <>Connect Wallet</>
            )}
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
