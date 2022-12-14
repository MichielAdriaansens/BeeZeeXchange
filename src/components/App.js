
import { useEffect } from 'react';
import {ethers} from 'ethers';

import config from '../config.json';

import {useDispatch} from 'react-redux';
import {
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents,
  loadAllOrders
} from '../store/interactions';

import Navbar from './Navbar';
import Markets from './Markets';
import Balance from './Balance';
import Order from './Order';
import OrderBook from './OrderBook';
import Transactions from './Transactions';
import Trades from './Trades';
import PriceChart from './PriceChart';
import Alert from './Alert';

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
    const token = await loadTokens([config[chainId].BCC.address, config[chainId].HIP.address, config[chainId].FAC.address], provider, dispatch);
  //  console.log("Token Adress: ", config[chainId].BCC.address);
  //  console.log("Token name: ", await token.name());
    console.log("Token symbol: ", await token.symbol())
    console.log('total amount: ', ethers.utils.formatEther(await token.totalSupply()));

    const exchange = await loadExchange(config[chainId].exchange.address, provider, dispatch);
    console.log("Exchange adress: ", exchange.address);
    console.log('Exchange feeAccount adr: ',await exchange.feeAccount())

    //loading all orders made
    await loadAllOrders(provider,exchange, dispatch);

    //event Listener
    subscribeToEvents(exchange, dispatch)
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
          <Balance/>
          {/* Order */}
          <Order/>

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}
          <PriceChart/>

          {/* Transactions */}
          <Transactions/>
          {/* Trades */}
          <Trades/>

          {/* OrderBook */}
          <OrderBook/>

        </section>
      </main>

      {/* Alert */}
      <Alert/>
    </div>
  );
}

export default App;
