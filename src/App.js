import React, { useState, useEffect } from "react";
import "./styles.css";
import { Magic } from "magic-sdk";
import { SolanaExtension } from "@magic-ext/solana";
import * as web3 from "@solana/web3.js";
import { AwesomeButton} from "react-awesome-button";
import 'react-awesome-button/dist/themes/theme-rickiest.css';
import Mango from "./Mango";
import FadeIn from "react-fade-in";

const magic = new Magic("pk_live_27D4CE5DA9E43129", {
  extensions: {
    solana: new SolanaExtension({
      rpcUrl: "https://api.mainnet-beta.solana.com"
    })
  }
});

export default function App() {
  const [email, setEmail] = useState("");
  const [publicAddress, setPublicAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [sendAmount, setSendAmount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userMetadata, setUserMetadata] = useState({});
  const [txHash, setTxHash] = useState("");
  const [sendingTransaction, setSendingTransaction] = useState(false);

  useEffect(() => {
    magic.user.isLoggedIn().then(async (magicIsLoggedIn) => {
      setIsLoggedIn(magicIsLoggedIn);
      if (magicIsLoggedIn) {
        const metadata = await magic.user.getMetadata()
        setPublicAddress(metadata.publicAddress);
        setUserMetadata(metadata);
      }
    });
  }, [isLoggedIn]);

  const login = async () => {
    await magic.auth.loginWithMagicLink({ email });
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await magic.user.logout();
    setIsLoggedIn(false);
  };

  const handlerSendTransaction = async () => {
    setSendingTransaction(true);
    const metadata = await magic.user.getMetadata();
    const transaction = web3.SystemProgram.transfer({
      fromPubkey: metadata.publicAddress,
      toPubkey: destinationAddress,
      lamports: sendAmount
    });

    const tx = await magic.solana.sendAndConfirmTransaction(transaction);
    setSendingTransaction(false);

    setTxHash(tx);

    console.log("send transaction", tx);
  };
  var QRCode = require('qrcode.react');
  

  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="container1">
          <h1> Lamport Wallet, allows you to move less than pennies on the blockchain </h1>
          <h3>Please sign up or login</h3>
          <h5>ONLY USE IN DESKTOP/BROWSER</h5>
          <input
            type="email"
            name="email"
            required="required"
            placeholder="Enter your email"
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
          <AwesomeButton type="secondary" ripple onPress={login}>Send</AwesomeButton>
        </div>
      ) : (
        <div>
          <FadeIn>
          <div className="container">
            <h1>Current user: {userMetadata.email}</h1>
            <AwesomeButton
            type="secondary" 
            ripple
            onPress={logout}>Logout</AwesomeButton>
          </div>
        </FadeIn>
          <div className="container">
            <h2>Markets</h2>
            <AwesomeButton
            size="icon"
            type="secondary"
            href="https://blockfolio.com/">
                🅱️    
            </AwesomeButton>
            <AwesomeButton
            size="icon"
            type="secondary"
            href="https://www.oxygen.org/">
              ❄️
            </AwesomeButton>
            <AwesomeButton
            size="icon"
            type="secondary"
            href="https://raydium.io/swap/">
              🧊
            </AwesomeButton>
            <AwesomeButton
            size="icon"
            type="secondary"
            href="https://openserum.ch/#/add?pair=SOL-BTC">
              🌀
            </AwesomeButton>
            <AwesomeButton
            size="icon"
            type="secondary"
            href="https://openserum.ch/mango-ui/#/market/">
              🥭
            </AwesomeButton>

            <hr/>
            <h1>Solana address</h1>
            <div className="info">{publicAddress}</div>
            <FadeIn>
            <QRCode value={publicAddress} />
            <br/>
            <hr />
            <AwesomeButton type="secondary"
            onPress={() =>  navigator.clipboard.writeText(publicAddress)
            } 
            >
              Copy
            </AwesomeButton>
            </FadeIn>
          </div>
          <div className="container">
            <FadeIn
            >
           <h3> 1,000,000,000 lamports = 1 SOL </h3>
            {txHash ? (
              <div>
                <div>Send transaction success</div>
                <span></span>
                <div className="info">{txHash}</div>
              </div>
            ) : sendingTransaction ? (
              <div className="sending-status">Sending transaction</div>
              ) : (
                <div />
                )}
            <input
              type="text"
              name="destination"
              className="full-width"
              required="required"
              placeholder="Destination address"
              onChange={(event) => {
                setDestinationAddress(event.target.value);
              }}
              />
            <input
              type="text"
              name="amount"
              className="full-width"
              required="required"
              placeholder="Amount in LAMPORTS"
              onChange={(event) => {
                setSendAmount(event.target.value);
              }}
              />
            <AwesomeButton type="secondary" id="btn-send-txn" onPress={handlerSendTransaction}>
            <span role="img" aria-label="rocket">Send 🚀 </span>
            </AwesomeButton>
            <br/>
            <AwesomeButton
            size="medium"
            type="secondary"
            onPress={() => window.open(" https://explorer.solana.com/address/"+publicAddress ) }
            >
            Balance ☀️  
            </AwesomeButton>
          </FadeIn>
          </div>
        </div>
      )}
    </div>
  );
}
