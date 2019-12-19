import { createActions } from 'redux-actions'

export const LOGIN_BY_CODE = 'LOGIN_BY_CODE'
export const LOGIN_BY_CODE_START = 'LOGIN_BY_CODE_START'
export const LOGIN_BY_CODE_SUCCEED = 'LOGIN_BY_CODE_SUCCEED'
export const LOGIN_BY_CODE_FAIL = 'LOGIN_BY_CODE_FAIL'


export const MODIFY_NICKNAME = 'MODIFY_NICKNAME'
export const MODIFY_NICKNAME_START = 'MODIFY_NICKNAME_START'
export const MODIFY_NICKNAME_SUCCEED = 'MODIFY_NICKNAME_SUCCEED'
export const MODIFY_NICKNAME_FAIL = 'MODIFY_NICKNAME_FAIL'

export const MODIFY_PASSWORD = 'MODIFY_PASSWORD'
export const MODIFY_PASSWORD_START = 'MODIFY_PASSWORD_START'
export const MODIFY_PASSWORD_SUCCEED = 'MODIFY_PASSWORD_SUCCEED'
export const MODIFY_PASSWORD_FAIL = 'MODIFY_PASSWORD_FAIL'

export const MODIFY_AVATAR = 'MODIFY_AVATAR'
export const MODIFY_AVATAR_START = 'MODIFY_AVATAR_START'
export const MODIFY_AVATAR_SUCCEED = 'MODIFY_AVATAR_SUCCEED'
export const MODIFY_AVATAR_FAIL = 'MODIFY_AVATAR_FAIL'

export const CLEAR_TOKEN = 'CLEAR_TOKEN'


const fn = (payload) => {
    return payload
}

export const { loginByCode, modifyNickname, modifyPassword, modifyAvatar, clearToken } = createActions({
    [LOGIN_BY_CODE]: fn,
    [MODIFY_NICKNAME]: fn,
    [MODIFY_PASSWORD]: fn,
    [MODIFY_AVATAR]: fn,
    [CLEAR_TOKEN]: fn,
})