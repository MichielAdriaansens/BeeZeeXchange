import dappLogo from '../assets/dapp.svg';
import ethLogo from '../assets/eth.svg';
import {useSelector, useDispatch} from 'react-redux';
import { useEffect, useState, useRef  } from 'react';

import { loadBalances,transferTokens } from '../store/interactions';

function Balance(){
    
  const [isDeposit,setIsDeposit] = useState(true);
  const [token1TransferAmount, setToken1TransferAmount] = useState(0);
  const [token2TransferAmount, setToken2TransferAmount] = useState(0);
  const dispatch = useDispatch();
 
  const symbols = useSelector(state => state.tokens.symbols);  
  const exchange = useSelector(state => state.exchange.contract);
  const exchangeBalances = useSelector(state => state.exchange.balances);
  const transferInProgress = useSelector(state => state.exchange.transferInProgress);
  const tokens = useSelector(state => state.tokens.contracts);
  const tokenBalances = useSelector(state => state.tokens.balances);
  const account = useSelector((state)=>{return state.provider.account});
  const provider = useSelector(state => state.provider.connection);

  const depositRef = useRef(null);
  const withdrawRef = useRef(null);

  useEffect(() => {
    if(exchange && tokens[0] && tokens[1] && account){
    loadBalances(exchange, account, tokens, dispatch);
    }
  }, [exchange, tokens,account, transferInProgress,dispatch]); //!! de ,[] laat weten als 1 vd variabelen in array verranderd voer useEffect nog een keer uit

  function tabHandler(event){
    if(event.target.className !== depositRef.current.className){
      event.target.className = 'tab tab--active';
      depositRef.current.className = 'tab';

      setIsDeposit(false);
    }
    else{
      event.target.className = 'tab tab--active';
      withdrawRef.current.className = 'tab';
      
      setIsDeposit(true);
    }
  }
  
  function amountHandler(event, token){
    if(token.address === tokens[0].address){
      setToken1TransferAmount(event.target.value);
    }
    if(token.address === tokens[1].address){
      setToken2TransferAmount(event.target.value);
    }
   // console.log({token2TransferAmount});
  }

  function depositHandler(event, token){
    event.preventDefault();
    if(token.address === tokens[0].address){
      transferTokens(provider,token1TransferAmount,token,exchange, dispatch);
      setToken1TransferAmount(0);
    }
    else if(token.address === tokens[1].address){
      transferTokens(provider,token2TransferAmount,token,exchange, dispatch);
      setToken2TransferAmount(0);
    }
  }

  function withdrawHandler(event, token){
    event.preventDefault();
  }

  return (
    <div className='component exchange__transfers'>
      <div className='component__header flex-between'>
        <h2>Balance</h2>
        <div className='tabs'>
          <button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
          <button onClick={tabHandler} ref={withdrawRef} className='tab'>Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
            <p><small>Token</small><br/><img src={dappLogo} alt="Token logo"/>{symbols && symbols[0]}</p>
            <p><small>Wallet</small><br/>{tokenBalances && Number(tokenBalances[0]).toFixed(1)}</p>
            <p><small>Exchange</small><br/>{exchangeBalances && Number(exchangeBalances[0]).toFixed(1)}</p>
        </div>

        <form onSubmit={(e) => isDeposit? depositHandler(e, tokens[0]) : withdrawHandler(e, tokens[0])}>
          <label htmlFor="token0">{symbols && symbols[0]} Amount:</label>
          <input 
          type="text" 
          id='token0' 
          placeholder='0.0000' 
          onChange={(e)=> amountHandler(e, tokens[0])}
          value = {token1TransferAmount === 0? '' : token1TransferAmount}  
          />

          <button className='button' type='submit'>
            <span>{isDeposit? "Deposit" : "Withdraw"}</span>
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
        <p><small>Token</small><br/><img src={ethLogo} alt="Token logo"/>{symbols && symbols[1]}</p>
            <p><small>Wallet</small><br/>{tokenBalances && Number(tokenBalances[1]).toFixed(1)}</p>
            <p><small>Exchange</small><br/>{exchangeBalances && Number(exchangeBalances[1]).toFixed(1)}</p>
        </div>

        <form onSubmit={(e) => isDeposit? depositHandler(e, tokens[1]) : withdrawHandler(e, tokens[1])}>
          <label htmlFor="token1"></label>
          <input 
          type="text" 
          id='token1' 
          placeholder='0.0000'
          onChange={(e) => amountHandler(e, tokens[1])}
          value={token2TransferAmount === 0? '' : token2TransferAmount}  
          />

          <button className='button' type='submit'>
            <span>{isDeposit? "Deposit" : "Withdraw"}</span>
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
}

export default Balance;