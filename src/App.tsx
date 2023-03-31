import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Web3Button } from '@web3modal/react';
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useSendTransaction,
} from 'wagmi';
import { usePrepareSendTransaction, useWaitForTransaction } from 'wagmi';
import { formatEther, parseEther } from 'ethers/lib/utils.js';
import { useDebounce } from 'use-debounce';
import { BigNumber, ethers } from 'ethers';

const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Deposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdrawal',
    type: 'event',
  },
  {
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

function App() {
  const [count, setCount] = useState(0);

  const balance = useBalance();
  const account = useAccount();

  const { data: getBalanceContract } = useContractRead({
    address: '0xD358434cBbDB230AA5d4b5C2211d2a2040D2929d',
    abi: abi,
    functionName: 'getBalance',
    watch: true,
    overrides: {
      from: account ? account.address : undefined,
    },
  });

  // DEPOSIT
  const { config, error } = usePrepareContractWrite({
    address: '0xD358434cBbDB230AA5d4b5C2211d2a2040D2929d',
    abi: abi,
    functionName: 'deposit',
    overrides: {
      from: account ? account.address : undefined,
      value: ethers.utils.parseEther(count.toString()),
    },
  });
  const { write } = useContractWrite(config);

  // WITHDRAW
  const { config: withdrawConfig, error: errorConfig } =
    usePrepareContractWrite({
      address: '0xD358434cBbDB230AA5d4b5C2211d2a2040D2929d',
      abi: abi,
      functionName: 'withdraw',
      args: [ethers.utils.parseEther(count.toString())],
      overrides: {
        from: account ? account.address : undefined,
      },
    });
  const { write: writeWithdraw } = useContractWrite(withdrawConfig);

  // pass overrides into the write function
  return (
    <div className="App">
      <h1>{account.address}</h1>
      <div className="card">
        <Web3Button />
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <button>Read contract</button>
      <br />
      <p>{formatEther(getBalanceContract?.toString() ?? BigNumber.from(0))}</p>
      <br />
      <br />
      <input
        type={'number'}
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
      />
      <button
        onClick={() => {
          write?.();
        }}
      >
        Depositar
      </button>
      <br />
      <button
        onClick={() => {
          writeWithdraw?.();
        }}
      >
        Retirar
      </button>
    </div>
  );
}

export default App;
