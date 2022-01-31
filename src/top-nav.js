import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import ProfileIcon from './profile-icon';
import { clickMobileSearchIcon, toggleMobileNavigation } from './actions';
import { toggleModal } from 'components/common/askQuestionFormModal/actions';
import { fetchUser } from '../loginModal/actions';
import Search from './search/Search';
import style from './style.less';
import withStyles from 'decorators/withStyles';
import Button from 'components/common/button';
import SearchOverlay from './search/searchOverlay';
import MobileSearchOverlay from './search/mobileSearchOverlay';
import cn from 'classnames';
import { useMoralis } from 'react-moralis';

const TopNav = ({ user }) => {
  const [hovering, setHovering] = useState(null);
  const dispatch = useDispatch();
  const { Moralis } = useMoralis();

  const renderNavigationItems = (hovering) => <div className={style.navigationItemsContainer}>
    <Link
      to="/feed"
      className={style.navItem}
      style={{ textDecoration: 'none', color: (hovering == '/' ? '#3d3d3d' : '#696969') }}
      onMouseEnter={() => handleHover('/')}
      onMouseLeave={() => handleHover(null)}
      onClick={() => handleClickNavItem('/')}
    >Home</Link>
    <Link
      to="/answer"
      className={style.navItem}
      style={{ textDecoration: 'none', color: (hovering == '/answer' ? '#3d3d3d' : '#696969') }}
      onMouseEnter={() => handleHover('/answer')}
      onMouseLeave={() => handleHover(null)}
      onClick={() => handleClickNavItem('/answer')}
    >Answer</Link>
    <Link
      to="/notifications"
      className={style.navItem}
      style={{ textDecoration: 'none', color: (hovering == '/notifications' ? '#3d3d3d' : '#696969') }}
      onMouseEnter={() => handleHover('/notifications')}
      onMouseLeave={() => handleHover(null)}
      onClick={() => handleClickNavItem('/notifications')}
      rel="nofollow"
    >Notifications</Link>
  </div>;


  const renderMobileSearchIcon = () => <div className={style.mobileSearchButton} onClick={handleShowMobileSearchOverlay}></div>;

  // #TODO attach on click handler
  const renderMobileNavigationIcon = () => <div className={style.mobileNavigationButton} onClick={handleToggleMobileNavigation}>
    <span className={style.dot}></span>
    <span className={style.dot}></span>
    <span className={style.dot}></span>
  </div>

  const renderAddNewQuestionButton = user => {
    if (user) {
      return <div className={style.addNewQuestionButton} onClick={handleClickAddNewQuestionButton}>+</div>;
    }
  }

  const maybeRenderProfileIcon = user => {
    if (user) {
      return <div className={style.user} >
        <ProfileIcon userName={user.name} />
      </div>;
    }
  }

  const maybeRenderSignInSignUpButtons = user => {
    if (!user) {
      return <div className={style.auth} >
        <Button cssClass={cn(style.navButton, style.signUp)} onButtonClick={() => handleClickConnect()}>CONNECT</Button>
      </div>;
    }
  }

  const handleClickNavItem = (route) => {
    if (window.location.pathname == route) {
      window.scrollTo(0, 0)
      window.location.reload()
    }
  }

  const handleToggleMobileNavigation = () => {
    dispatch(toggleMobileNavigation());
  }

  const handleHover = (path) => {
    setHovering(path)
  }

  const handleClickAddNewQuestionButton = () => {
    dispatch(toggleModal());
  }

  const handleShowMobileSearchOverlay = () => {
    dispatch(clickMobileSearchIcon());
  }

  const handleClickConnect = async () => {
    try {
      let loginUser = await Moralis.User.current();

      if (!loginUser) {
        await Moralis.enableWeb3();
        loginUser = await Moralis.authenticate({ signingMessage: "Log in using Moralis" });
      }

      await dispatch(fetchUser(loginUser.get('username'), loginUser.get('ethAddress')));
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={style.fixedWrapper} >
      <div className={style.navContainer} >
        <Link
          to="/feed"
          className={style.logo}
          onClick={() => handleClickNavItem('/')}
        ></Link>
        <Search
          className={style.search}
        />
        {renderNavigationItems(hovering)}
        {renderMobileSearchIcon()}
        {renderMobileNavigationIcon()}
        {maybeRenderProfileIcon(user)}
        {maybeRenderSignInSignUpButtons(user)}
        {renderAddNewQuestionButton(user)}
        <SearchOverlay />
        <MobileSearchOverlay />
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  const { globalUserState } = state;
  const user = globalUserState && globalUserState.user;

  return {
    user
  };
}

export default connect(mapStateToProps)(withStyles(style)(TopNav));
