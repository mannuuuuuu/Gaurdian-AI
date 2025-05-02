import { useQuery } from "@tanstack/react-query";
import { getEvents, getContractEvents } from "@/lib/blockchain";
import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/lib/groq";
import { Event } from "@shared/schema";

interface EventLogProps {
  compact?: boolean;
  contractFilter?: string;
}

const EventLog = ({ compact = false, contractFilter }: EventLogProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  
  const { data: events, isLoading } = useQuery({
    queryKey: contractFilter ? ['/api/events/contract', contractFilter] : ['/api/events'],
    queryFn: () => contractFilter ? getContractEvents(parseInt(contractFilter, 10), 20) : getEvents(20),
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  const getLogTypeClass = (event: any) => {
    if (event.eventName === 'AlertSubmitted' || event.eventName === 'BadgeRevoked') {
      return 'error';
    }
    
    if (event.eventName === 'Vote' || event.eventName === 'ProposalCreated') {
      return 'warning';
    }
    
    if (event.eventName === 'ProposalExecuted' || event.eventName.includes('Success')) {
      return 'info';
    }
    
    return '';
  };

  const formatLogEntry = (event: any) => {
    const timestamp = formatDate(event.timestamp);
    return `[${timestamp}] Event: ${event.eventName}(${formatEventParams(event.eventData)})`;
  };

  const formatEventParams = (eventData: any) => {
    if (!eventData) return '';
    
    return Object.entries(eventData)
      .map(([key, value]) => `${key}: ${formatValue(value)}`)
      .join(', ');
  };

  const formatValue = (value: any) => {
    if (typeof value === 'string' && value.startsWith('0x')) {
      return `${value.substring(0, 6)}...${value.substring(value.length - 4)}`;
    }
    return value;
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-gray-700 shadow-md mb-6">
      <div className="border-b border-gray-700 px-4 py-3 flex justify-between items-center">
        <h2 className="font-medium">
          {contractFilter ? 'Contract Event Log' : 'Live Event Monitor'}
        </h2>
        <div className="flex items-center text-xs text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse mr-2"></span>
          {contractFilter ? 'Filtered View' : 'Live Monitoring'}
        </div>
      </div>
      <div 
        ref={terminalRef}
        className={`terminal ${compact ? 'h-48' : 'h-64'} p-1 text-sm overflow-auto`}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          const isScrolledToBottom = 
            Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 10;
          setAutoScroll(isScrolledToBottom);
        }}
      >
        {isLoading ? (
          <div className="terminal-line">Loading events...</div>
        ) : events && events.length > 0 ? (
          <>
            <div className="terminal-line info">[{new Date().toISOString().replace('T', ' ').slice(0, 19)}] ✓ Connected to Soneium RPC at https://rpc.scs.soneium.io</div>
            <div className="terminal-line command">{'>'} Guardian AI monitoring service initialized with Groq LLama3-8b-8192</div>
            
            {events.map((event: any) => (
              <div key={event.id} className={`terminal-line ${getLogTypeClass(event)}`}>
                {formatLogEntry(event)}
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="terminal-line info">[{new Date().toISOString().replace('T', ' ').slice(0, 19)}] ✓ Connected to Soneium RPC at https://rpc.scs.soneium.io</div>
            <div className="terminal-line command">{'>'} Guardian AI monitoring service initialized with Groq LLama3-8b-8192</div>
            <div className="terminal-line">Waiting for blockchain events...</div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventLog;
