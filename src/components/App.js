
import { useEffect } from 'react';
import {ethers} from 'ethers';

import config from '../config.json';

import {useDispatch} from 'react-redux';
import {
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadTokens,
  loadExchange
} from '../store/interactions';

import Navbar from './Navbar';
import Markets from './Markets';

function App() {

  const dispatch = useDispatch();

  async function loadBlockChainData() {
    //provider
    const provider = await loadProvider(dispatch);
    
    //get network 31337
    const chainId = await loadNetwork(dispatch, provider);
     console.log("network Id: ", chainId);

    //reload on network change
    window.ethereum.on('networkChanged', async () => {
      window.location.reload();
    })

    //load account and get balance form metamask when changed
    window.ethereum.on('accountsChanged', async () => {
      await loadAccount(provider, dispatch);
    })
    //const account =await loadAccount(provider, dispatch);
    //console.log("account from MetaMask: ",account);

    //Token Contract
    const token = await loadTokens([config[chainId].BCC.address, config[chainId].HIP.address], provider, dispatch);
  //  console.log("Token Adress: ", config[chainId].BCC.address);
    console.log("Token name: ", await token.name());
    console.log("Token symbol: ", await token.symbol())
    console.log('total amount: ', ethers.utils.formatEther(await token.totalSupply()));

    const exchange = await loadExchange(config[chainId].exchange.address, provider, dispatch);
    console.log("Exchange adress: ", exchange.address);
    console.log('Exchange feeAccount adr: ',await exchange.feeAccount())
  }

  useEffect(()=>{
    loadBlockChainData();
  });

  return (
    <div>

      {/* Navbar */}
      <Navbar/>
      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}
          <Markets/>
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
