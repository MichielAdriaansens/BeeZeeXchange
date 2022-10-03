import { createSelector } from "reselect";
import { get, groupBy, reject, maxBy,minBy } from "lodash";
import { ethers } from "ethers";
import moment from "moment";

const tokens = state => get(state, 'tokens.contracts');
const allOrders = state => get(state, 'exchange.allOrders.data', []);
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', []);
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

//kleur voor buy/sell order
const GREEN = '#25CE8F';
const RED = '#F45353';

const openOrders = state => {
   const all = allOrders(state)
   const cancelled = cancelledOrders(state);
   const filled = filledOrders(state);

   const openOrders = reject(all, (order) => {
      const orderFilled = filled.some((o) => o.id.toString() === order.id.toString());
      const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString());

      return (orderFilled || orderCancelled); 
   })

   return openOrders;
}

//OrderBook
export const OrderBookSelector = createSelector(openOrders, tokens, (orders, tokens) => {

   if(!tokens[0] || !tokens[1]) {return};

   //filter out the tokens that is equal to order.tokenGet/give
   orders = orders.filter((o) => {return o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address});
   orders = orders.filter((o) => {return o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address});
   
   orders = decorateOrderBookOrders(orders, tokens);
   
   //lodash's groupBy verdeeld orders array afhankelijk van de orderType value
   orders = groupBy(orders, 'orderType');

   //lodash's get zoekt naar onderdelen van array selecteert ze op basis van 'buy' en slaat het op  in een array
   //en anders returned het een empty array
   const buyOrders = get(orders,'buy', []);
   const sellOrders = get(orders,'sell', []); 

   // .sort rangschikt de orde van onderdelen in een array
   orders = {
      ...orders,
      buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice),
      sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
   } 
   
  // console.log(orders);
   return orders;
})

//voegt informatie(key: value) toe aan order object
const decorateOrder = (order , tokens) =>{
   let token0amount, token1amount, tokenPrice;

   //BCC = token0amount, HIP = token1 amount
   if(tokens[1].address === order.tokenGive){
      //formatUnits geeft decimal punt aan.. toString doet dat niet

      token0amount = ethers.utils.formatUnits(order.amountGive, 'ether'); //'ether' = 18 ivbm decimals 
      token1amount = ethers.utils.formatUnits(order.amountGet, 18) ;
   }
   else{
      token0amount = ethers.utils.formatUnits(order.amountGet, 'ether');
      token1amount = ethers.utils.formatUnits(order.amountGive, 'ether');
   }

   tokenPrice = Math.round((token1amount /token0amount) * 100000) / 100000;

   return{
      ...order,
      token0amount: token0amount,
      token1amount: token1amount,
      tokenPrice,     // is hetzelfde als tokenPrice: tokenPrice
      formattedTimeStamp: moment.unix(order.timeStamp).format("h:mm:ssa DD MMMM YYYY")
   }
}


export function decorateOrderBookOrders(orders, tokens){

   return(
      orders.map((order) => {

         order = decorateOrder(order, tokens);
         order = _decorateOrderBookOrder(order, tokens);
         
         //console.log(order);
         return order;
      })
   )
}

function _decorateOrderBookOrder(order, tokens){
   //turnary.. buy type order of sell type order
   const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell';

   return{
      ...order,
      orderType,
      orderTypeClass:( orderType === 'buy'? GREEN : RED),
      orderFillAction: (orderType === 'buy'? 'sell' : 'buy') 
   }
}

//-----------------
//Price Chart selector
export const priceChartSelector = createSelector(filledOrders, tokens, (orders, tokens) => {
   if(!tokens[0] || !tokens[1]){return};
   
   orders = orders.filter((o) => {return o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address});
   orders = orders.filter((o) => {return o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address});
   
   orders.sort((a, b) => a.timeStamp - b.timeStamp);

   orders = orders.map((o) => decorateOrder(o, tokens));

   const lastOrder = [orders[orders.length -1], orders[orders.length -2]];
   let lastprice = get(lastOrder[0], 'tokenPrice', 0); //alternatief: lastOrder? lastOrder.tokenPrice : '0';
   let secondLastPrice = get(lastOrder[1], 'tokenPrice', 0);
   console.log(secondLastPrice);
   
   return({
      lastprice: lastprice,
      priceChange: (lastprice >= secondLastPrice? '+' : '-'),
      series : [{
         data: buildGraphData(orders)
      }]
   }) 
})

function buildGraphData(orders){
   //groupBy devides an array.. by the hour of an order's timeStamp value.
   //Note: the newly created array will adopt the name of the value used to devide the prior array with.
   //..in this case the timeStamp.  
   orders = groupBy(orders, (o) => moment.unix(o.timeStamp).startOf('hour').format())

   //returns array of the keys(instead of the values attached to the key)
   const hours = Object.keys(orders);

   const graphData = hours.map((hour) => {

      //stores all orders with corresponding hour
      const group = orders[hour];

      //sort first last order and lowest and highest token price
      const open = group[0];
      const high = maxBy(group, 'tokenPrice');
      const low = minBy(group, "tokenPrice");
      const close = group[group.length -1];

      return ({
         x: new Date(hour),
         y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
      })
   })
   return graphData;
}