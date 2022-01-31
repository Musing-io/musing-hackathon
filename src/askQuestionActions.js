import { sendPostRequest, sendGetRequest } from 'helpers/utils'
import shortid from 'shortid-36'
import { push } from 'react-router-redux'
import { clear as clearTagsSearch } from '../tagsSearch/actions'
import { en as postType } from 'enums/postType'
import { UserPostAbi } from "helpers/abi";
import { UserPostContract } from "helpers/constants";
import Moralis from 'moralis';

export const CLEAR = 'CLEAR_ASK_QUESTION'
export const TOGGLE_MODAL = 'TOGGLE_ASK_QUESTION_MODAL'
export const CHANGE_FIELD = 'CHANGE_ASK_QUESTION_FIELD'
export const TOGGLE_LOADING = 'TOGGLE_ASK_QUESTION_LOADING'
export const ADD_CATEGORY = 'ADD_ASK_QUESTION_CATEGORY'
export const SET_FORM_ERRORS = 'SET_ASK_QUESTION_FORM_ERRORS'

export function clear() {
  return {
    type: CLEAR
  }
}

export function toggleModal() {
  return {
    type: TOGGLE_MODAL
  };
}

export function changeField(field, value) {
  return {
    type: CHANGE_FIELD,
    field,
    value
  };
}

function toggleLoading() {
  return {
    type: TOGGLE_LOADING
  }
}

export function addCategory(category) {
  return {
    type: ADD_CATEGORY,
    category
  }
}

const generateSlug = async (question, author) => {
  let slug = question.replace(/[^a-z0-9\s]/gi, '');
  slug = slug.replace(/\s+/g, '-').toLowerCase();
  slug = slug.substring(0, 150);

  let p = (await sendGetRequest(`/posts?author=${author}&slug=${slug}`)).data.posts;
  if (p && p.length) {
    slug = `${slug}-${shortid.generate().toLowerCase()}`;
  }

  return slug;
}

export function submitQuestion(account, question, description, tagsList, user) {
  return async dispatch => {
    try {
      dispatch(toggleLoading());

      // create slug on client and see if it exists
      const slug = await generateSlug(question, user.name);
      const sid = shortid.generate().toLowerCase()
      const title = question
      const body = description
      const tags = tagsList.split(/[ ,]+/).map((t) => t.toLowerCase())
      const category = tags[0]
      const depth = 1
      const type = postType.QA.ordinal

      let query = {
        permlink: sid,
        author: user.name,
        slug,
        parentPermlink: null,
        parentAuthor: null,
        title,
        body,
        tags,
        category,
        depth,
        type
      }

      const web3 = await Moralis.enableWeb3();
      const contract = new web3.eth.Contract(UserPostAbi.abi, UserPostContract);

      const file = new Moralis.File(`${sid}.json`, { base64: btoa(JSON.stringify(query)) });
      await file.saveIPFS();

      const hash = file.hash();
      // const hash = 'QmSCFCg4LviZZtu4CC32odaxDcAXGf4z3NjdECuj7rjBc8'
      query.ipfsHash = hash;

      let response = await contract.methods.publish(hash).send({ from: account });

      if (response.status) {
        console.log('response', response)
        query.transactionHash = response.transactionHash;
        let newPost = (await sendPostRequest('/posts', query)).data.post;

        dispatch(clear());
        dispatch(clearTagsSearch());
        dispatch(toggleModal());
        dispatch(push(`/q/${user.name}/${query.slug}`));
      }
    } catch (error) {
      dispatch(toggleLoading());
    }
  }
}

export function submitLink(account, url, tagsList, user) {
  return async dispatch => {
    try {
      dispatch(toggleLoading());
      let res = (await sendGetRequest(`/proxy?url=${encodeURIComponent(url)}`))?.data

      // create slug on client and see if it exists
      const slug = await generateSlug(res.title);
      const sid = shortid.generate().toLowerCase()
      const title = res.title
      const body = res.description
      const tags = tagsList.split(/[ ,]+/)
      const category = tags[0]
      const depth = 1
      const type = postType.LINK.ordinal
      const image = res.image

      let query = {
        permlink: sid,
        author: user.name,
        slug,
        parentPermlink: null,
        parentAuthor: null,
        url,
        title,
        body,
        tags,
        category,
        depth,
        type,
        image
      }

      const web3 = await Moralis.enableWeb3();
      const contract = new web3.eth.Contract(UserPostAbi.abi, UserPostContract);

      const file = new Moralis.File(`${sid}.json`, { base64: btoa(JSON.stringify(query)) });
      await file.saveIPFS();

      const hash = file.hash();
      // const hash = 'QmSCFCg4LviZZtu4CC32odaxDcAXGf4z3NjdECuj7rjBc8'
      query.ipfsHash = hash;

      let response = await contract.methods.publish(hash).send({ from: account });

      if (response.status) {
        query.transactionHash = response.transactionHash;
        let newPost = (await sendPostRequest('/posts', query)).data.post;

        dispatch(clear());
        dispatch(clearTagsSearch());
        dispatch(toggleModal());
        dispatch(push(`/q/${user.name}/${newPost.slug}`));
      }
    } catch (error) {
      dispatch(toggleLoading());
    }
  }
}

export function setFormErrors(errorType) {
  return {
    type: SET_FORM_ERRORS,
    errorType
  }
}
