import { useRef } from "react";
import { useSelector } from "react-redux";
import { myOpenOrdersSelector } from "../store/selectors";

import sort from '../assets/sort.svg';
import Banner from "./Banner";

function Transactions(){
    const myOpenOrders = useSelector(myOpenOrdersSelector);
    const symbols = useSelector(state => state.tokens.symbols);
    const ordersRef = useRef(null);
    const tradesRef = useRef(null);    

    function tabHandler(event){
        if(event.target.className !== ordersRef.current.className){
            ordersRef.current.className = 'tab';
            tradesRef.current.className = 'tab tab--active';
        }
        else{
            ordersRef.current.className = 'tab tab--active';
            tradesRef.current.className = 'tab';
        }

    }

    return(
        <div className="component exchange__transactions">
            <div>
                <div className='component__header flex-between'>
                    <h2>My Orders</h2>

                    <div className='tabs'>
                    <button ref={ordersRef} onClick={tabHandler} className='tab tab--active'>Orders</button>
                    <button ref={tradesRef} onClick={tabHandler} className='tab'>Trades</button>
                    </div>
                </div>
                {!myOpenOrders? (<Banner text='No open orders'/>): 
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
                                        <td style={{color: o.orderTypeClass}}>{o.token0amount}</td>
                                        <td>{o.tokenPrice}</td>
                                        <td>{/* Cancel Order Button*/}</td>
                                    </tr>
                                )
                            })}

                        </tbody>
                    </table>              
                )}
            </div>

            {/* <div> */}
            {/* <div className='component__header flex-between'> */}
                {/* <h2>My Transactions</h2> */}

                {/* <div className='tabs'> */}
                {/* <button className='tab tab--active'>Orders</button> */}
                {/* <button className='tab'>Trades</button> */}
                {/* </div> */}
            {/* </div> */}

            {/* <table> */}
                {/* <thead> */}
                {/* <tr> */}
                    {/* <th></th> */}
                    {/* <th></th> */}
                    {/* <th></th> */}
                {/* </tr> */}
                {/* </thead> */}
                {/* <tbody> */}

                {/* <tr> */}
                    {/* <td></td> */}
                    {/* <td></td> */}
                    {/* <td></td> */}
                {/* </tr> */}

                {/* </tbody> */}
            {/* </table> */}

            {/* </div> */}
        </div>
    )
}

export default Transactions;