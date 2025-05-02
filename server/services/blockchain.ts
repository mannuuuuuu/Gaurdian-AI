import { ethers } from 'ethers';
import { storage } from '../storage';
import type { Contract, InsertEvent } from '@shared/schema';

// RPC URL from environment variables
const RPC_URL = process.env.RPC_URL || 'https://rpc.scs.soneium.io';

// Guardian contract ABIs
const FEED_ABI = [
  "event AlertSubmitted(address indexed submitter, uint256 indexed alertId, string description)",
  "event AlertResolved(uint256 indexed alertId, address indexed resolver)"
];

const DAO_ABI = [
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description)",
  "event Vote(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight)",
  "event ProposalExecuted(uint256 indexed proposalId)"
];

const BADGE_ABI = [
  "event BadgeClaim(address indexed claimer, uint256 indexed tokenId)",
  "event BadgeRevoked(uint256 indexed tokenId, address indexed revoker, string reason)"
];

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contracts: Map<string, ethers.Contract>;
  private listeners: Map<string, ethers.Contract>;

  constructor() {
    // Initialize the provider
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.contracts = new Map();
    this.listeners = new Map();
  }

  async initialize() {
    try {
      // Test connection
      const blockNumber = await this.provider.getBlockNumber();
      console.log(`Connected to Soneium blockchain, current block: ${blockNumber}`);
      
      // Initialize contracts from storage
      const contracts = await storage.getContracts();
      for (const contract of contracts) {
        this.initializeContract(contract);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      return false;
    }
  }
  
  private getContractAbi(type: string) {
    switch (type.toUpperCase()) {
      case 'FEED':
        return FEED_ABI;
      case 'DAO':
        return DAO_ABI;
      case 'BADGE':
        return BADGE_ABI;
      default:
        return [];
    }
  }

  private initializeContract(contract: Contract) {
    const { address, type, abi } = contract;
    
    try {
      // Use provided ABI or default based on contract type
      const contractAbi = abi || this.getContractAbi(type);
      
      if (!contractAbi.length) {
        console.warn(`No ABI available for contract ${contract.name}`);
        return false;
      }
      
      // Create a contract instance
      const ethersContract = new ethers.Contract(address, contractAbi, this.provider);
      this.contracts.set(address, ethersContract);
      
      console.log(`Initialized contract: ${contract.name} (${address})`);
      
      // Start listening to events
      this.setupEventListeners(contract, ethersContract);
      
      return true;
    } catch (error) {
      console.error(`Error initializing contract ${contract.name}:`, error);
      return false;
    }
  }
  
  private async setupEventListeners(contract: Contract, ethersContract: ethers.Contract) {
    // Listen for all events defined in the ABI
    ethersContract.removeAllListeners();
    
    // For each event in the ABI
    for (const fragment of ethersContract.interface.fragments) {
      if (fragment.type !== 'event') continue;
      
      const eventName = fragment.name;
      
      ethersContract.on(eventName, async (...args) => {
        // The last argument contains the event object with info like transaction hash
        const eventObj = args[args.length - 1];
        
        // Extract useful info
        const { blockNumber, transactionHash, args: eventArgs } = eventObj;
        
        console.log(`Event detected: ${eventName} on contract ${contract.name}`);
        
        // Store event in database
        try {
          const eventData: InsertEvent = {
            contractId: contract.id,
            eventName,
            blockNumber,
            transactionHash,
            eventData: this.formatEventArgs(eventArgs)
          };
          
          await storage.createEvent(eventData);
        } catch (error) {
          console.error(`Error storing event ${eventName}:`, error);
        }
      });
    }
    
    // Store in the listeners map
    this.listeners.set(contract.address, ethersContract);
    console.log(`Event listeners set up for contract: ${contract.name}`);
  }
  
  private formatEventArgs(args: any): Record<string, any> {
    // Convert BigInt to strings to make it JSON serializable
    const formatted: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(args)) {
      // Skip numeric keys (args are both indexed by position and name)
      if (!isNaN(Number(key))) continue;
      
      formatted[key] = typeof value === 'bigint' 
        ? value.toString() 
        : value;
    }
    
    return formatted;
  }
  
  async getContractCode(address: string): Promise<string> {
    return await this.provider.getCode(address);
  }
  
  async getContractAt(address: string): Promise<ethers.Contract | undefined> {
    return this.contracts.get(address);
  }
  
  async getBlockTimestamp(blockNumber: number): Promise<number> {
    const block = await this.provider.getBlock(blockNumber);
    return block ? block.timestamp : 0;
  }
}

export const blockchainService = new BlockchainService();
