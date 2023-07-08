'use client';

import jwtDecode from "jwt-decode";
import { useCallback, useMemo, useRef, useState, useSyncExternalStore, useContext } from "react";
import { createContext } from "react";
import dayjs from 'dayjs';
import { cookies } from 'next/headers'; // Import cookies

// const authStore = () => {
//   const token = window != undefined ? localStorage.getItem('token') : null;
//   // const [token, setToken] = useState(lt)
//   const user = token ? jwtDecode(token) : null

//   // useMemo(() => {
//   //   if (!token) return null

//   //   return jwtDecode(token)
//   // }, [token])

//   const store = useRef({ user, token })

//   const get = () => { return store.current }
//   const set = (token) => {
//     localStorage.setItem('token', token)
//     // setToken(token)
//     const user = token ? jwtDecode(token) : null
//     store.current = { user, token }
//     subscriber.current.forEach(callback => callback())
//   }

//   const subscriber = useRef([])
//   const subscribe = (callback) => {
//     subscriber.current.push(callback)
//     return () => {
//       const index = subscriber.current.indexOf(callback);
//       if (index > -1)
//         subscriber.current.splice(index, 1);
//     }
//   }

//   return { get, set, subscribe }
// }

const AuthContext = createContext(null)

const useAuthContext = () => {
  const authStore = useContext(AuthContext)
  // if (!authStore)
  //   return {}

  const { get, set, subscribe } = authStore
  const storeSate = useSyncExternalStore(subscribe, get, get)

  return { ...storeSate, setToken: set }
}

const AuthProvider = ({ children }) => {
  // here, cause warning: Hydration failed because the initial UI does not match what was rendered on the server.
  // so it's better to save token in cookie
  // when user request, server will get token from cookie
  // const token = typeof window === "undefined" ? "" : localStorage.getItem('token');

  // get token from cookie  
  const token = typeof window === "undefined" ? cookies().get('token') : (document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] ?? '')

  // const [token, setToken] = useState(lt)
  const user = token ? jwtDecode(token) : null

  // useMemo(() => {
  //   if (!token) return null

  //   return jwtDecode(token)
  // }, [token])

  const store = useRef({ user, token })

  const get = () => { return store.current }
  const set = (token) => {
    //token を cookie に保存する
    document.cookie = `token=${token}; expires=${dayjs(new Date()).add(1, 'M').toDate()}; path=/`;
    // localStorage.setItem('token', token)
    // setToken(token)
    const user = token ? jwtDecode(token) : null
    store.current = { user, token }
    subscriber.current.forEach(callback => callback())
  }

  const subscriber = useRef([])
  const subscribe = (callback) => {
    subscriber.current.push(callback)
    return () => {
      const index = subscriber.current.indexOf(callback);
      if (index > -1)
        subscriber.current.splice(index, 1);
    }
  }

  const provider = <AuthContext.Provider value={{ get, set, subscribe }} >{children}</AuthContext.Provider >

  return provider
}

export { AuthProvider, useAuthContext };