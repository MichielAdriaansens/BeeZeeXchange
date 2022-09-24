import dappLogo from '../assets/dapp.svg';
import {useSelector, useDispatch} from 'react-redux';
import { useEffect, useState  } from 'react';

import { loadBalances,transferTokens } from '../store/interactions';

function Balance(){
    
  const [token1TransferAmount, setToken1TransferAmount] = useState(0);
  const dispatch = useDispatch();
 
  const symbols = useSelector(state => state.tokens.symbols);  
  const exchange = useSelector(state => state.exchange.contract);
  const exchangeBalances = useSelector(state => state.exchange.balances);
  const transferInProgress = useSelector(state => state.exchange.transferInProgress);
  const tokens = useSelector(state => state.tokens.contracts);
  const tokenBalances = useSelector(state => state.tokens.balances);
  const account = useSelector((state)=>{return state.provider.account});
  const provider = useSelector(state => state.provider.connection);
  

  useEffect(() => {
    if(exchange && tokens[0] && tokens[1] && account){
    loadBalances(exchange, account, tokens, dispatch);
    }
  }, [exchange, tokens,account, transferInProgress,dispatch]); //!! de ,[] laat weten als 1 vd variabelen in array verranderd voer useEffect nog een keer uit

  function amountHandler(event, token){
    if(token.address === tokens[0].address){
      setToken1TransferAmount(event.target.value);
    }
  }

  function depositHandler(event, token){
    event.preventDefault();
    if(token.address === tokens[0].address){
      transferTokens(provider,token1TransferAmount,token,exchange, dispatch);
      setToken1TransferAmount(0);
    }
  }

  return (
    <div className='component exchange__transfers'>
      <div className='component__header flex-between'>
        <h2>Balance</h2>
        <div className='tabs'>
          <button className='tab tab--active'>Deposit</button>
          <button className='tab'>Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
            <p><small>Token</small><br/><img src={dappLogo} alt="Token logo"/>{symbols && symbols[0]}</p>
            <p><small>Wallet</small><br/>{tokenBalances && Number(tokenBalances[0]).toFixed(1)}</p>
            <p><small>Exchange</small><br/>{exchangeBalances && Number(exchangeBalances[0]).toFixed(1)}</p>
        </div>

        <form onSubmit={(e) => depositHandler(e, tokens[0])}>
          <label htmlFor="token0">{symbols && symbols[0]} Amount:</label>
          <input 
          type="text" 
          id='token0' 
          placeholder='0.0000' 
          onChange={(e)=> amountHandler(e, tokens[0])}
          value = {token1TransferAmount === 0? '' : token1TransferAmount}  
          />

          <button className='button' type='submit'>
            <span>Deposit</span>
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>

        </div>

        <form>
          <label htmlFor="token1"></label>
          <input type="text" id='token1' placeholder='0.0000'/>

          <button className='button' type='submit'>
            <span></span>
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
}

export default Balance;