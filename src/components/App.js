
import { useEffect } from 'react';
import {ethers} from 'ethers';

import config from '../config.json';

import {useDispatch} from 'react-redux';
import {
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadToken
} from '../store/interactions';


function App() {

  const dispatch = useDispatch();

  async function loadBlockChainData() {

    const account =await loadAccount(dispatch);
    console.log("account from MetaMask: ",account);
  
    //provider
    const provider =await loadProvider(dispatch);
    
    // {chainId} is eigenlijk provider.getNetwork().chainId.. een key van object in de getnetwork functie
    const chainId = await loadNetwork(dispatch, provider);
     console.log("network Id: ", chainId);

    //Token Contract
    const token = await loadToken(config[chainId].BCC.address, provider, dispatch);
    console.log("Token Adress: ", config[chainId].BCC.address);
    console.log("Token name: ", await token.name());
    console.log("Token symbol: ", await token.symbol())
    console.log('total amount: ', ethers.utils.formatEther(await token.totalSupply()));
  }

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
