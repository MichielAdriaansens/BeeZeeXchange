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
   console.log("account balance: ", balance);   
   dispatch({type: 'BALANCE_LOADED', balance}); //belangerijk! de naam vd const moet overeenkomen met reducer objectnaam

   return account;
}

export async function loadTokens(addresses, provider, dispatch){
    let token , symbol;
     token =  new ethers.Contract(addresses[0] , TOKEN_ABI, provider);
     symbol = await token.symbol();

    dispatch({ type: 'TOKEN_1_LOADED', token, symbol });

    token =  new ethers.Contract(addresses[1] , TOKEN_ABI, provider);
    symbol = await token.symbol();

    dispatch({ type: 'TOKEN_2_LOADED', token, symbol });

    return token;
}

export async function loadExchange(address, provider, dispatch){
    let exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);

    dispatch({type: 'EXCHANGE_LOADED', exchange});

    return exchange;
}

export async function loadBalances(exchange,account,tokens,dispatch){

    console.log(tokens);

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
    exchange.on('Deposit', (token, user, balance, event) => {
        dispatch({type: 'TRANSFER_SUCCESS', event });
    });
}

//------------------
//Transfer Tokens
export async function transferTokens(provider, amount, token, exchange, dispatch){
    dispatch({type: 'TRANSFER_REQUEST'});
    try {
        const signer = await provider.getSigner();
        const amountToTransfer = ethers.utils.parseUnits(amount.toString(),18);
    
        let transaction = await token.connect(signer).approve(exchange.address, amountToTransfer);
        await transaction.wait();
    
    
        transaction = await exchange.connect(signer).depositToken(token.address,amountToTransfer);
        await transaction.wait();
    
    } catch(error){
        console.error(`mamma sae mamma saa mamma sakoesaa!! \n`, error)
        dispatch({type: 'TRANSFER_FAIL'})
    };
}