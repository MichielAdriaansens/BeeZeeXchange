import { ethers } from "ethers";
import TOKEN_ABI from '../abis/Token.json';
import EXCHANGE_ABI from '../abis/Exchange.json';
//import { provider } from "./reducers";

export function loadProvider(dispatch){
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    
    //connection hoef je niet appart key te typen als key & value zelfde naam hebben
    dispatch({type: 'PROVIDER_LOADED', connection});

    return connection;
}

export async function loadNetwork(dispatch, provider){
    // {chainId} is eigenlijk provider.getNetwork().chainId.. een key van object in de getnetwork functie
    const { chainId } = await provider.getNetwork();

   dispatch({type: 'NETWORK_LOADED', chainId});
   return chainId;
}

export async function loadAccount(provider, dispatch){
   const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
   const account = ethers.utils.getAddress(accounts[0]);
   
   dispatch({type: 'ACCOUNT_LOADED', account});

   const balance = ethers.utils.formatEther(await provider.getBalance(account)); 
   
   dispatch({type: 'BALANCE_LOADED', balance}); //belangerijk! de naam vd const moet overeenkomen met reducer objectnaam

   return account;
}
/*
export async function loadTokens(addresses, provider, dispatch){
    let token , symbol, name;
     token =  new ethers.Contract(addresses[0] , TOKEN_ABI, provider);
     symbol = await token.symbol();

     //console.log('token1 name: ', await token.name());
     name = await token.name();

     
    dispatch({ type: 'TOKEN_1_LOADED', token, symbol, name });

    token =  new ethers.Contract(addresses[1] , TOKEN_ABI, provider);
    symbol = await token.symbol();
    name = await token.name();

    dispatch({ type: 'TOKEN_2_LOADED', token, symbol, name });

    return token;
}
*/
export async function loadTokens(addresses, provider, dispatch){
    let token , symbol, name;

    for(let count = 0; count < addresses.length; count++)
    {
        token =  new ethers.Contract(addresses[count] , TOKEN_ABI, provider);
        symbol = await token.symbol();
        name = await token.name();
       // console.log(count, await token.name());
        dispatch({ type: `TOKEN_${count + 1}_LOADED`, token, symbol, name });
    }
    
    return token;
}

export async function loadExchange(address, provider, dispatch){
    let exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);

    dispatch({type: 'EXCHANGE_LOADED', exchange});

    return exchange;
}

export async function loadBalances(exchange,account,tokens,dispatch){

    //console.log(tokens);

    let balance = await tokens[0].balanceOf(account);
    balance = ethers.utils.formatUnits(balance, 18);
    dispatch({type: 'BALANCE_TOKEN_1_LOADED', balance});

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account));
    dispatch({type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED',balance});

    balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18);
    dispatch({type: 'BALANCE_TOKEN_2_LOADED', balance});

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account));
    dispatch({type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED',balance});
}

export function subscribeToEvents(exchange, dispatch){
    exchange.on('Deposit', (token, user, amount ,balance, event) => {
        dispatch({type: 'TRANSFER_SUCCESS', event });
    });
    exchange.on('Withdraw', (token, user, amount ,balance, event) => {
        dispatch({type: 'TRANSFER_SUCCESS', event });
    });
    exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timeStamp, event) => {
        const order = event.args;
        dispatch({type: 'NEW_ORDER_SUCCES', order, event});
    });
    exchange.on('Cancel', (id, user, tokenGet, amountGet, tokenGive, amountGive, timeStamp, event) => {
        const order = event.args;
        dispatch({type: 'CANCEL_ORDER_SUCCESS', order, event});
    });
    exchange.on('Trade', (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timeStamp, event) =>{
        const order = event.args;
        //je geeft de order en event variabelen door aan de reducer en roept ze op met action. let dus op gelijke benaming!!
        dispatch({type: 'FILL_ORDER_SUCCESS', order, event});
    });
}

//------------------
//Transfer Tokens
export async function transferTokens(provider, amount, token, exchange, transferType, dispatch){
    dispatch({type: 'TRANSFER_REQUEST'});
    try {
        let transaction;
        const signer = await provider.getSigner();
        const amountToTransfer = ethers.utils.parseUnits(amount.toString(),18);
        if(transferType === 'Deposit'){
            transaction = await token.connect(signer).approve(exchange.address, amountToTransfer);
            await transaction.wait();
        
            transaction = await exchange.connect(signer).depositToken(token.address,amountToTransfer);
            await transaction.wait();
        } 
        else if(transferType === "Withdraw"){
            transaction = await exchange.connect(signer).withdrawToken(token.address,amountToTransfer);
            await transaction.wait();
        }
    } catch(error){
        console.error(`transaction FAILED!! \n`, error);
        dispatch({type: 'TRANSFER_FAIL'});
    };
}
//--------------
//Orders
export async function makeBuyOrder(provider, exchange, tokens, order, dispatch){
    let transaction;   

    const tokenGet = tokens[0].address;
    const amountGet = ethers.utils.parseUnits(order.amount.toString(), 18); 
    const tokenGive = tokens[1].address;
    const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18); 
    
    dispatch({type: 'NEW_ORDER_REQUEST'});

    try{
        const signer = await provider.getSigner();
        transaction = await exchange.connect(signer).makeOrder(tokenGet,amountGet,tokenGive,amountGive);
        await transaction.wait();
    }catch(error){
        console.error(`Making Order FAILED!! \n`, error);
        dispatch({type: 'NEW_ORDER_FAIL'});
    };

}
export async function makeSellOrder(provider, exchange, tokens, order, dispatch){
    let transaction;   

    const tokenGet = tokens[1].address;
    const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 18); 
    const tokenGive = tokens[0].address;
    const amountGive = ethers.utils.parseUnits(order.amount.toString(), 18); 
    
    dispatch({type: 'NEW_ORDER_REQUEST'});

    try{
        const signer = await provider.getSigner();
        transaction = await exchange.connect(signer).makeOrder(tokenGet,amountGet,tokenGive,amountGive);
        await transaction.wait();
    }catch(error){
        console.error(`Making Order FAILED!! \n`, error);
        dispatch({type: 'NEW_ORDER_FAIL'});
    };
}
export async function loadAllOrders(provider, exchange, dispatch){
    const block = await provider.getBlockNumber();

    //get cancelled orders.. searching the 'Cancel' event
    const cancelStream = await exchange.queryFilter('Cancel', 0, block);
    const cancelledOrders = await cancelStream.map(event => event.args);

    dispatch({type:'CANCELLED_ORDERS_LOADED', cancelledOrders});

    //get Filled Orders
    const tradeStream = await exchange.queryFilter('Trade', 0, block);
    const filledOrders = await tradeStream.map(event => event.args);
    
    dispatch({type: 'FILLED_ORDERS_LOADED', filledOrders});

    //get Orders
    //queryFilter retrieves all Order events from 0 to block.. wich is current block
    const orderStream = await exchange.queryFilter('Order', 0, block);
    const allOrders = await orderStream.map(event => event.args);

    dispatch({type: 'ALL_ORDERS_LOADED', allOrders});
}

export async function cancelOrder(order, provider, exchange, dispatch){
    
    let transaction;
    dispatch({type: 'CANCEL_ORDER_REQUEST', transaction});

    try{
        const signer = await provider.getSigner()
        transaction = await exchange.connect(signer).cancelOrder(order.id);
        await transaction.wait();
    }catch(error){
        console.error(`FAILED to cancel Order!!\n`, error);
        dispatch({type: 'CANCEL_ORDER_FAIL'});
    }


}

export async function fillOrder(order, provider, exchange, dispatch){
    let transaction
    dispatch({type: 'FILL_ORDER_REQUEST', transaction} );
    
    try{
    let account = await provider.getSigner();

    transaction = await exchange.connect(account).fillOrder(order.id);
    await transaction.wait();
    }catch(error){
        console.error(`FAILED to fill order! \n`, error);
        dispatch({type: 'FILL_ORDER_FAIL'});
    }
}