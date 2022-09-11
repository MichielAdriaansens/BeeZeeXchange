import '../App.css';
import { useEffect } from 'react';
import {ethers} from 'ethers';
import TOKEN_ABI from '../abis/Token.json';
import config from '../config.json';

async function loadBlockChainData() {
  const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
  console.log("account from MetaMask: ", accounts[0]);

  //provider
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  // {chainId} is eigenlijk provider.getNetwork().chainId.. een key van object in de getnetwork functie
  const { chainId } = await provider.getNetwork();
  console.log("network Id: ", chainId);

  //Token Contract
  const token = new ethers.Contract(config[chainId].BCC.address, TOKEN_ABI, provider)
  console.log("Token Adress: ", config[chainId].BCC.address);
  console.log("Token name: ", await token.name());
  console.log('total amount: ', ethers.utils.formatEther(await token.totalSupply()))
}

function App() {

  useEffect(()=>{
    loadBlockChainData();
  });

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
