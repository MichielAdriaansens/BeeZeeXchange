import { useSelector, useDispatch } from 'react-redux';
import {useRef, useState} from 'react';
import { makeBuyOrder, makeSellOrder } from '../store/interactions';

function Order(){
    const [amount, setAmount] = useState(0);
    const [price, setPrice] = useState(0);
    
    const [isBuying, setIsBuying] = useState(true);
    
    const buyRef = useRef(null);
    const sellRef = useRef(null);

    const dispatch = useDispatch();
    const provider = useSelector(state => state.provider.connection);
    const exchange = useSelector(state => state.exchange.contract);
    const tokens = useSelector(state => state.tokens.contracts);

    function tabHandler(event)
    {
        if(event.target.className !== buyRef.current.className){
            buyRef.current.className = 'tab';
            sellRef.current.className = 'tab tab--active';
            
            setIsBuying(false);
        }
        else{
            sellRef.current.className = 'tab';
            buyRef.current.className = 'tab tab--active';

            setIsBuying(true);
        }
    }
    function amountHandler(event){
        setAmount(event.target.value);
    }
    function priceHandler(event){
        setPrice(event.target.value);
    }
    function buyHandler(event){
        event.preventDefault();
        console.log('Buy Order.. woa wa whee');
        
        makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch);
        
        setAmount(0);
        setPrice(0);
    }
    function sellHandler(event){
        event.preventDefault();
        console.log('sell Order... KOMBOWAH!!');

        makeSellOrder(provider, exchange, tokens, { amount, price }, dispatch);

        setAmount(0);
        setPrice(0);
    }

    return (
        <div className="component exchange__orders">
          <div className='component__header flex-between'>
            <h2>New Order</h2>
            <div className='tabs'>
              <button onClick={tabHandler} ref={buyRef} className='tab tab--active'>Buy</button>
              <button onClick={tabHandler} ref={sellRef} className='tab'>Sell</button>
            </div>
          </div>
    
          <form onSubmit={isBuying? buyHandler : sellHandler}>
            {/* <p><small>Amount:</small></p> */}
            <label htmlFor='amount'>{isBuying? "Buy Amount" : "Sell Amount"}</label>
            <input type="text" id='amount' placeholder='0.0000' onChange={amountHandler} value={amount === 0? '': amount}/>
            
            {/* <p><small>Price:</small></p> */}
            <label htmlFor='price'>{isBuying? "Buy Price" : "Sell Price"}</label>
            <input type="text" id='price' placeholder='0.0000' onChange={priceHandler} value={price ===0? '': price}/>
    
            <button className='button button--filled' type='submit'>
                <span>{isBuying? "Buy" : "Sell"}</span>
            </button>
          </form>
        </div>
      );
}

export default Order;