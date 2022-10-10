import { createSelector } from "reselect";
import { get, groupBy, reject, maxBy,minBy } from "lodash";
import { ethers } from "ethers";
import moment from "moment";

const account = state => get(state, 'provider.account');
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
//---------------
//My open Orders
export const myOpenOrdersSelector = createSelector(openOrders, tokens, account, (orders, tokens, account) => {
   if(!account || !tokens[0] || !tokens[1]) {return};

   //filter by current account
   orders = orders.filter((o) => {return o.user === account });

   //filter orders by the selected tokens (Market component)
   orders = orders.filter((o) => {return o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address});
   orders = orders.filter((o) => {return o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address});

   orders = decorateMyOpenOrders(orders, tokens);

   orders = orders.sort((a,b) => {return b.timeStamp - a.timeStamp})

   return orders;
})

function decorateMyOpenOrders(orders, tokens){
   return (
      orders.map((o) => {
         o = decorateOrder(o,tokens);
         o = _decorateMyOpenOrder(o, tokens);

         return o;
      })
   )
}
function _decorateMyOpenOrder(order, tokens){
   const orderType = order.tokenGive === tokens[1].address? 'buy' : 'sell';

   return {
      ...order,
      orderType,
      orderTypeClass: orderType === 'buy'? GREEN : RED
   };
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
      formattedTimeStamp: moment.unix(order.timeStamp).format("h:mm:ssa DD MMMM")
   }
}


export function decorateOrderBookOrders(orders, tokens){

   return(
      orders.map((order) => {

         order = decorateOrder(order, tokens);
         order = _decorateOrderBookOrder(order, tokens);
         
        // console.log('orderBookOrders',order);
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
//-------------
//All Filled Orders
export const filledOrdersSelector = createSelector(filledOrders, tokens, (orders, tokens) => {
   if(!tokens[0] || !tokens[1]){return};

   //filter orders by the selected tokens (Market component)
   orders = orders.filter((o) => {return o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address});
   orders = orders.filter((o) => {return o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address});

   //sort ascending for correct comparison price 'previousOrder' 
   orders = orders.sort((a,b) => {return (a.timeStamp - b.timeStamp)});

   //decorate orders
   orders = decorateFilledOrders(orders,tokens);

   //sort descending for UI display
   orders = orders.sort((a,b) => {return (b.timeStamp - a.timeStamp)});

   //console.log('filledOrderSelector orders', orders);

   return orders;
})

function decorateFilledOrders(orders, tokens){
   let previousOrder = orders[0];
 
   return(
      orders.map(order => {
        
         order = decorateOrder(order,tokens);

         order = _decorateFilledOrder(order, previousOrder);
         
         previousOrder = order;

         return order;
      })
   )
}
function _decorateFilledOrder(order,previousOrder){
   
   return ({
      ...order,
      orderPriceClass: orderPriceClass(order,previousOrder)
   });
}

//-------------
//My Filled orders

export const myFilledOrderSelector = createSelector(account, tokens, filledOrders,(account, tokens,orders) =>{
   if(!tokens[0] || !tokens[1]){return}

   orders = orders.filter((o) => {return o.user === account || o.creator === account});

   orders = orders.filter((o) => {return o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address});
   orders = orders.filter((o) => {return o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address});

   orders = orders.sort((a,b) => a.timeStamp - b.timeStamp);
   
   orders = decorateMyFilledOrders(orders, tokens, account);

   orders = orders.sort((a,b) => b.timeStamp - a.timeStamp);
   
   return orders
})

function decorateMyFilledOrders(orders, tokens, account){
   return (orders.map((order) => {

      order = decorateOrder(order, tokens);
      order = _decorateMyFilledOrder(order,tokens, account);
      return order;
   }))
}

function _decorateMyFilledOrder(order, tokens, account){
   const myOrder = order.creator === account;

   let orderType;
   if(myOrder){
      orderType = order.tokenGive === tokens[1].address? 'buy' : 'sell';
   }
   else{
      orderType = order.tokenGive === tokens[1].address? 'sell' : 'buy';
   }
   return {
      ...order, 
      orderType,
      orderTypeClass: (orderType === 'buy'? GREEN : RED),
      orderSign: (orderType === 'buy'? '+' : '-')
   };
}

function orderPriceClass(order,previousOrder){
   if(order.id === previousOrder.id){
      return GREEN
   }
   else{
      return order.tokenPrice >= previousOrder.tokenPrice? GREEN : RED
   }
}

//!!!BONUS!!! Fix dat je meerdere opties hebt voor candle stick.. ipv hours dus days en weeks en months
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
  // console.log(secondLastPrice);
   
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