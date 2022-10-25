import { useSelector } from "react-redux";
import { useRef, useEffect, useState } from "react";
import { myEventsSelector } from "../store/selectors";
import pendingImg from '../assets/BZ_pend_1.jpeg';
import failImg from '../assets/BZ_fail_1.jpeg';
import goodImg from '../assets/BZ_good_1.jpeg';

import config from "../config.json";

function Alert(){
    
    const [onRefresh, setOnRefresh] = useState(true);

    const network = useSelector(state => state.provider.network);
   // const account = useSelector(state => state.provider.account);
    const myEvents = useSelector(myEventsSelector);
    
    //useRef geeft een referantie aan een component waarmee je in dit geval de classname ervan kan wijzigen
    const alertRef = useRef(null);
    const isPending = useSelector(state => state.exchange.transaction.isPending);
    const isError = useSelector(state => state.exchange.transaction.isError);
    //const isSuccess = useSelector(state => state.exchange.transaction.isSuccesfull);

    //useEffect zorgt dat de UI geupdate wordt als er een variabel verranderd.. in dit geval isPending
    useEffect(() => {
        isPending && setOnRefresh(false);

        if(!onRefresh && (myEvents[0] || isPending || isError) ){
            alertRef.current.className = 'alert alert';
        }

    }, [myEvents, isPending, isError, onRefresh]); //listeners for event in brackets

    async function removeHandler()
    {
        alertRef.current.className = 'alert alert--remove';

    }

    return (
        <div>
            {isPending ? (
                <div className="alert alert--remove" ref={alertRef} onClick ={removeHandler}>
                    <img src={pendingImg} alt='pending img'/>
                    <h1>Transaction Pending...</h1>
                </div>
            )
            : isError ? (
                <div className="alert alert--remove" ref={alertRef} onClick ={removeHandler}>
                    <img src={failImg} alt='fail img'/>
                    <h1>Transaction Will Fail</h1>
                </div>
            ) : !isPending && myEvents[0] ? (
                <div className="alert alert--remove" ref={alertRef} onClick ={removeHandler}>
                <img src={goodImg} alt="success img"/>
               
                    <div className="special">
                    <h1>Transaction Successful</h1>
                    <a
                    href={config[network] ? `${config[network].explorerUrl}/tx/${myEvents[0].transactionHash}` : '#'}
                    target='_blank'
                    rel='noreferrer'
                    >
                    {myEvents[0].transactionHash.slice(0,6) + '...' + myEvents[0].transactionHash.slice(60,66)}
                    </a>
                    </div>
                </div>
            ) : (<div className="alert alert--remove"></div>)
            }

        </div>
      );
}

export default Alert;
