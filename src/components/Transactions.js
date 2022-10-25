import { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { myOpenOrdersSelector, myFilledOrderSelector } from "../store/selectors";
import { cancelOrder } from "../store/interactions";

import sort from '../assets/sort.svg';
import Banner from "./Banner";

function Transactions(){
    const [isOrdering,setIsOrdering] = useState(true);
    const myOpenOrders = useSelector(myOpenOrdersSelector);
    const myFilledOrders = useSelector(myFilledOrderSelector);
    
    const provider = useSelector(state => state.provider.connection);
    const exchange = useSelector(state => state.exchange.contract);
    const symbols = useSelector(state => state.tokens.symbols);


    const ordersRef = useRef(null);
    const tradesRef = useRef(null);    

    const dispatch = useDispatch();

    function cancelHandler(order, provider, exchange ,dispatch){
       // console.log('cancel: ', order);
        cancelOrder(order,provider,exchange,dispatch);
    }

    function tabHandler(event){
        if(event.target.className !== ordersRef.current.className){
            ordersRef.current.className = 'tab';
            tradesRef.current.className = 'tab tab--active';
            setIsOrdering(false);
        }
        else{
            ordersRef.current.className = 'tab tab--active';
            tradesRef.current.className = 'tab';
            setIsOrdering(true);
        }

    }

    return(
        <div className="component exchange__transactions">
           {isOrdering? (
                <div>
                    <div className='component__header flex-between'>
                        <h2>My Orders</h2>

                        <div className='tabs'>
                        <button ref={ordersRef} onClick={tabHandler} className='tab tab--active'>Orders</button>
                        <button ref={tradesRef} onClick={tabHandler} className='tab'>Trades</button>
                        </div>
                    </div>
                    {!myOpenOrders || myOpenOrders.length === 0 ? (<Banner text='No open orders' />) :
                    (
                        <table>
                            <thead>
                                <tr>
                                    <th>{symbols && symbols[0]}<img src={sort} alt='sort' /></th>
                                    <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt='sort' /></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {myOpenOrders.map((o,index) => {
                                    return(
                                        <tr key={index}>
                                            <td style={{color: o.orderTypeClass}}>{o.token1amount}</td>
                                            <td>{o.tokenPrice}</td>
                                            {/* de arrow function verzekerd dat de cancelHandler met () alleen gecalled wordt na een click */}
                                            <td><button className='button--sm' onClick={() => {cancelHandler(o,provider,exchange,dispatch)}}>Cancel</button></td>
                                        </tr>
                                    )
                                })}

                            </tbody>
                        </table>              
                    )}
                </div>
           ) : (
                <div>
                    <div className='component__header flex-between'>
                        <h2>My Transactions</h2>

                        <div className='tabs'>
                        <button onClick={tabHandler} ref = {ordersRef} className='tab tab--active'>Orders</button>
                        <button onClick={tabHandler} ref = {tradesRef} className='tab'>Trades</button>
                    </div>
                </div>

                {!myFilledOrders? (<Banner text= 'No Order'/>) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Time <img src={sort} alt="sort"/></th>
                                <th>{symbols && symbols[0]}<img src={sort} alt='sort'/></th>
                                <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt='sort'/></th>
                            </tr>
                        </thead>
                        <tbody>
                            {myFilledOrders && myFilledOrders.map((o, index) => { 
                                return(
                                    <tr key={index}>
                                        <td>{o.formattedTimeStamp}</td>
                                        <td style={{color: o.orderTypeClass}}>{o.orderSign}{o.token1amount}</td>
                                        <td>{o.tokenPrice}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
           )}

        </div>
    )
}

export default Transactions;