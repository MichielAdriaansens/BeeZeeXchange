import { useSelector } from "react-redux";
import { useRef, useEffect } from "react";
import { myEventsSelector } from "../store/selectors";

import config from "../config.json";

function Alert(){
    
    const network = useSelector(state => state.provider.network);
    const account = useSelector(state => state.provider.account);
    const myEvents = useSelector(myEventsSelector);
    
    //useRef geeft een referantie aan een component waarmee je in dit geval de classname ervan kan wijzigen
    const alertRef = useRef(null);
    const isPending = useSelector(state => state.exchange.transaction.isPending);
    const isError = useSelector(state => state.exchange.transaction.isError);
    //const isSuccess = useSelector(state => state.exchange.transaction.isSuccesfull);

    //useEffect zorgt dat de UI geupdate wordt als er een variabel verranderd.. in dit geval isPending
    useEffect(() => {
        if((myEvents[0] || isPending || isError) && account ){
            alertRef.current.className = 'alert alert';
        }

    }, [myEvents, account, isPending, isError]); //listeners for event in brackets

    async function removeHandler()
    {
        alertRef.current.className = 'alert alert--remove';
    }

    return (
        <div>
            {isPending ? (
                <div className="alert alert--remove" ref={alertRef} onClick ={removeHandler}>
                    <h1>Transaction Pending...</h1>
                </div>
            )
            : isError ? (
                <div className="alert alert--remove" ref={alertRef} onClick ={removeHandler}>
                <h1>Transaction Will Fail</h1>
                </div>
            ) : !isPending && myEvents[0] ? (
                <div className="alert alert--remove" ref={alertRef} onClick ={removeHandler}>
                <h1>Transaction Successful</h1>
                    <a
                    href={config[network] ? `${config[network].explorerUrl}/tx/${myEvents[0].transactionHash}` : '#'}
                    target='_blank'
                    rel='noreferrer'
                    >
                    {myEvents[0].transactionHash.slice(0,6) + '...' + myEvents[0].transactionHash.slice(60,66)}
                    </a>
                </div>
            ) : (<div className="alert alert--remove"></div>)
            }

        </div>
      );
}

export default Alert;
