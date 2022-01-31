# Musing
Musing provides an infrastructure that supports a shared Q&A platform where
users can post questions and answers and earn tokens as a form of mining. Where
Bitcoin decentralizes currency, Musing decentralizes knowledge.

## General Info
This repo shows how we integrate moralis to musing in Avalanche Network.

## Technologies
This project is created with:
* Node v16.13.0
* React v17.0.2
* Moralis v0.0.183
* React-Moralis v0.3.11
* Web3js v1.6.1
* MongoDB
* Avalanche Network

## Moralis Functionalities
- `src/index.js` - Initializes moralis with Application ID and Server URL.
- `src/top-nav.js` - handleClickConnect function uses Moralis authentication that will handle user account management.
- `src/logout.js` - A component that will logout current moralis user.
- `src/askQuestionActions.js` - A component that will handle the submission of questions and links. It uses Moralis IPFS to store the data in a distributed file system and Moralis Web3 to connect and save user's post using IPFS hash in our avalanche contracts.
- `src/followUserActions.js` - A button component that will handle user's endorsements. It uses Moralis Web3 to connect users to our avalanche endorsement contract.

## Avalanche Contracts
- [MSC Token Contract](https://testnet.snowtrace.io/address/0xa7d162b9225d4522e3d7699c16430076cd3e0be6)
- [Post Contract (Questions and Answers)](https://testnet.snowtrace.io/address/0x73b8e5b58527F9f0afEc628779DDC214b37F6BA7)
- [Endorsement Contract](https://testnet.snowtrace.io/address/0xe50B6e75298aD3000C6DbAB6894302C47e0298cB)