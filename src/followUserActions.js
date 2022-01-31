import { MusingTokenAbi, EndorseUserAbi } from "helpers/abi";
import { MusingTokenContract, EndorseUserContract } from "helpers/constants";
import Moralis from "moralis";

export const SET_VALUE = 'SET_FOLLOW_USER_VALUE';
export const LOADING = 'LOADING_FOLLOW_USER';
export const SET_USER_BALANCE = 'SET_USER_BALANCE';

function loading(targetUser) {
  return {
    type: LOADING,
    targetUser
  };
}

export function setValue(id, value) {
  return {
    type: SET_VALUE,
    id,
    value
  };
}

export function setUserBalance(value) {
  return {
    type: SET_USER_BALANCE,
    userBalance: value
  };
}

export function toggle(account, targetUser, value, amount = 1) {
  return async dispatch => {
    const web3 = await Moralis.enableWeb3();
    const contract = new web3.eth.Contract(EndorseUserAbi.abi, EndorseUserContract);
    let response = null;

    dispatch(loading(targetUser));
    try {
      if (value) {
        const amountStr = web3.utils.toWei(amount.toString(), 'ether');

        response = await contract.methods.upvote(targetUser.account, amountStr).send({ from: account });
      } else {
        response = await contract.methods.unvote(targetUser.account).send({ from: account });
      }

      dispatch(setValue(targetUser.name, value));
    } catch (e) {
      console.log('err', e);
      dispatch(setValue(targetUser.name, !value));
    }
  };
}

export function fetchUserBalance(account) {
  return async dispatch => {
    try {
      let web3 = await Moralis.enableWeb3();
      const tokenContract = new web3.eth.Contract(MusingTokenAbi.abi, MusingTokenContract);
      const amount = await tokenContract.methods.balanceOf(account).call();
      dispatch(setUserBalance(web3.utils.fromWei(amount.toString(), 'ether')));
    } catch (err) {
      console.log(err)
    }
  };
}
