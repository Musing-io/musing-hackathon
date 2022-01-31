import React from 'react';
import withStyles from 'decorators/withStyles';
import style from './style.less';
import Moralis from 'moralis';

const LogoutButton = () => {

  const click = async (e) => {
    await Moralis.User.logOut();
    window.location.reload();
  }

  return (
    <button className={style.button} onClick={click}>Logout</button>
  );
}

export default withStyles(style)(LogoutButton);
