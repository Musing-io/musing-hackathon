import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Modal from 'react-modal';
import style from './style.less';
import withStyles from 'decorators/withStyles';
import { useMoralis } from 'react-moralis';
import { authenticate as authenticateUser, toggle } from './actions';
import Web3 from "web3";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

const WalletConnector = () => {
  const { user: moralisUser, Moralis, enableWeb3, authenticate } = useMoralis();
  const dispatch = useDispatch();

  const connectToCoinbase = async () => {
    try {
      dispatch(toggle('wallet_connector'));
      await Moralis.setEnableWeb3(async () => {
        const APP_NAME = "Musing";
        const APP_LOGO_URL = "https://example.com/logo.png";
        const DEFAULT_ETH_JSONRPC_URL = "https://api-wagmi.avax-test.network/rpc";
        const DEFAULT_CHAIN_ID = 11111;

        // Initialize Coinbase Wallet SDK
        const coinbaseWallet = new CoinbaseWalletSDK({
          appName: APP_NAME,
          appLogoUrl: APP_LOGO_URL,
          darkMode: false
        });

        // Initialize a Web3 Provider object
        const ethereum = coinbaseWallet.makeWeb3Provider(
          DEFAULT_ETH_JSONRPC_URL,
          DEFAULT_CHAIN_ID
        );

        // Initialize a Web3 object
        const web3 = new Web3(ethereum);
        const accounts = await ethereum.send('eth_requestAccounts')

        web3.eth.defaultAccount = accounts[0]
        return web3;
      });

      if (!moralisUser) {
        await enableWeb3();
        await authenticate({ signingMessage: "Log in using Moralis" });
      } else {
        await dispatch(authenticateUser(moralisUser.id, moralisUser.get('username'), moralisUser.get('ethAddress'), moralisUser.get('sessionToken')));
      }
    } catch (error) {
      await Moralis.setEnableWeb3(null)
      console.log(error)
    }
  }

  const connectToMetamask = async () => {
    try {
      dispatch(toggle('wallet_connector'));
      await Moralis.setEnableWeb3(async () => {
        try {
          let metamaskProvider = null;

          if (window.ethereum.providers) {
            metamaskProvider = window.ethereum.providers.find(p => p.isMetaMask);
          }

          if (!metamaskProvider && window.ethereum) {
            metamaskProvider = window.ethereum;
          }

          const web3 = new Web3(metamaskProvider);
          const accounts = await metamaskProvider.request({ method: "eth_requestAccounts" })

          web3.eth.defaultAccount = accounts[0]
          return web3;
        } catch (error) {
          console.log(error)
        }
      });

      if (!moralisUser) {
        await enableWeb3();
        await authenticate({ signingMessage: "Log in using Moralis" });
      } else {
        await dispatch(authenticateUser(moralisUser.id, moralisUser.get('username'), moralisUser.get('ethAddress'), moralisUser.get('sessionToken')));
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    Modal.setAppElement('body');
  }, []);

  return (
    <div className={style.body} style={{ padding: '15px 50px' }}>

      <img src='/static/logo.svg' className={style.image} />
      <div className={style.title}>
        Connect Wallet
      </div>

      <div
        style={{ display: 'flex', alignItems: 'center', margin: '35px auto 20px auto', outline: 'none', fontSize: '15px', fontWeight: '700', backgroundColor: '#f5f5f5', color: '#848484', border: '1px solid #e6e6e6', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}
        onClick={() => connectToCoinbase()}
      >
        <div><img src="/assets/img/coinbase.png" width="50px" /></div>
        <div style={{ flex: 1, marginLeft: '10px' }}>Coinbase Wallet</div>
        <div>
          <svg width="24px" height="24px" viewBox="0 0 24 24" role="img" stroke="#848484" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" color="#848484"> <title id="arrowRightIconTitle">Arrow Right</title> <path d="M15 18l6-6-6-6" /> <path d="M3 12h17" /> <path strokeLinecap="round" d="M21 12h-1" /> </svg>
        </div>
      </div>

      <div
        style={{ display: 'flex', alignItems: 'center', margin: '0px auto 20px auto', outline: 'none', fontSize: '15px', fontWeight: '700', backgroundColor: '#f5f5f5', color: '#848484', border: '1px solid #e6e6e6', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}
        onClick={() => connectToMetamask()}
      >
        <div><img src="/assets/img/metamask.png" width="50px" /></div>
        <div style={{ flex: 1, marginLeft: '10px' }}>Metamask</div>
        <div>
          <svg width="24px" height="24px" viewBox="0 0 24 24" role="img" stroke="#848484" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" color="#848484"> <title id="arrowRightIconTitle">Arrow Right</title> <path d="M15 18l6-6-6-6" /> <path d="M3 12h17" /> <path strokeLinecap="round" d="M21 12h-1" /> </svg>
        </div>
      </div>
    </div>
  );
}

export default withStyles(style)(WalletConnector);
