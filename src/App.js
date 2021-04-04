import React, { useState, useEffect } from "react";
import "./styles.css";
import { Magic } from "magic-sdk";
import { SolanaExtension } from "@magic-ext/solana";
import * as web3 from "@solana/web3.js";
import { AwesomeButton, AwesomeButtonSocial } from "react-awesome-button";
import 'react-awesome-button/dist/themes/theme-rickiest.css';

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
        <div className="container">
          <h1>Please sign up or login</h1>
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
          <div className="container">
            <h1>Current user: {userMetadata.email}</h1>
            <AwesomeButton
            type="secondary" 
            ripple
            onPress={logout}>Logout</AwesomeButton>
          </div>
          <div className="container">
            <h1>Solana address</h1>
            <div className="info">{publicAddress}</div>
            <QRCode value={publicAddress} />
          </div>
          <div className="container">
            <h1>Send Transaction</h1>
            {txHash ? (
              <div>
                <div>Send transaction success</div>
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
          </div>
          <div className="container">
          <AwesomeButton type="secondary" id="btn-send-txn" onPress={window.open("https://openserum.ch/mango-ui/#/market/C1EuT9VokAKLiW7i2ASnZUvxDoKuKkCpDDeNxAptuNe4")}>
          <span role="img" aria-label="mango">Mango Market🥭</span>
            </AwesomeButton>
          </div>
        </div>
      )}
    </div>
  );
}
