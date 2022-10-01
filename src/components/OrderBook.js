import { useSelector } from "react-redux";
import sort from  '../assets/sort.svg';
import { OrderBookSelector } from "../store/selectors";

function OrderBook(){
    const symbols = useSelector(state => state.tokens.symbols);
    const orderBook = useSelector(OrderBookSelector);

    return (
        <div className="component exchange__orderbook">
            <div className='component__header flex-between'>
            <h2>Order Book</h2>
            </div>

            <div className="flex">
            {!orderBook || orderBook.sellOrders === 0? (<p className="flex-center">No sell Orders!</p>) :
            (
                <table className='exchange__orderbook--sell'>
                    <caption>Selling</caption>
                    <thead>
                    <tr>
                        <th>{symbols && symbols[0]}<img src={sort} alt="sort"/></th>
                        <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="sort"/></th>
                        <th>{symbols && symbols[1]}<img src={sort} alt="sort"/></th>
                    </tr>
                    </thead>
                    <tbody>
                    {orderBook && orderBook.sellOrders.map((order, index) => 
                        <tr key={index}>
                            <td >{order.token0amount}</td>
                            <td style={{color: order.orderTypeClass}}>{order.tokenPrice}</td>
                            <td >{order.token1amount}</td>
                        </tr>
                    )}
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    </tbody>
                </table>
            )}


            <div className='divider'></div>

            {!orderBook || orderBook.buyOrders === 0? (<p className="flex-center">No buy Orders!</p>) : 
            (
                <table className='exchange__orderbook--buy'>
                    <caption>Buying</caption>
                    <thead>
                    <tr>
                        <th>{symbols && symbols[0]}<img src={sort} alt="sort"/></th>
                        <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="sort"/></th>
                        <th>{symbols && symbols[1]}<img src={sort} alt="sort"/></th>
                    </tr>
                    </thead>
                    <tbody>
                    {orderBook && orderBook.buyOrders.map((order,index) => 
                        <tr key={index}>
                            <td>{order.token0amount}</td>
                            <td style={{color: order.orderTypeClass}}>{order.tokenPrice}</td>
                            <td>{order.token1amount}</td>
                        </tr> 
                    )}                   
                    </tbody>
                </table>
            )}

            </div>
        </div>
    );
}

export default OrderBook;