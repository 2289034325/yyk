"use client"

import { useEffect, useMemo, useLayoutEffect, useCallback, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Scheduler } from '@aldabil/react-scheduler';
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
import { BOOKS } from '@services/cache';
import { addBook, deleteBook, editBook, getBooks } from '@services/api';
import { v4 as uuid } from 'uuid';

const Home = () => {
  const { data: session } = useSession();


  //予約すみデータを取得する
  const getBooks = async () => {
    const response = await fetch(`http://localhost:3000/api/book`, { method: "GET" });
    const data = await response.json();

    const bookData = data.map(d => { return { event_id: d.id, title: d.title, start: new Date(d.start), end: new Date(d.end) } })

    console.log('books', bookData)

    return bookData;
  }

  //予約追加
  const addBook = async (params) => {
    const token = session.user.token;
    await fetch(`http://localhost:3000/api/book`, {
      method: "POST",
      headers: {
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(params)
    });
  }

  //予約変更
  const editBook = async (params) => {
    const token = session.user.token;
    await fetch(`http://localhost:3000/api/book`, {
      method: "PUT",
      headers: {
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(params)
    });
  }

  //予約削除
  //nextjs bug
  //next api always ignore request body.
  //passing id from url params to solve the problem.
  //or using dynamic path api
  const deleteBook = async (params) => {
    const token = session.user.token;
    await fetch(`http://localhost:3000/api/book?id=${params.id}`, {
      method: "DELETE",
      headers: {
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(params)
    });
  }


  const queryClient = useQueryClient()
  const calendarRef = useRef(null);

  // データ操作
  const { refetch: refechBooks } = useQuery([BOOKS], getBooks, {
    refetchOnWindowFocus: false,
    enabled: false // disable this query from automatically running
  });
  const addMutation = useMutation(addBook);
  const editMutation = useMutation(editBook);
  const deleteMutation = useMutation(deleteBook);

  refechBooks().then(res => console.log('res', res))

  //予約確認ボタン処理
  const onConfirm = async (event, action) => {
    if (!event.event_id)
      event.event_id = uuid()
    const { event_id: id, title, start, end } = event;

    //予約追加
    if (action === 'create') {
      let success = false;
      await addMutation.mutateAsync({ id, title, start, end }, {
        onSuccess: () => {
          //この書き方はuseQueryを動かして、RerenderもFired
          // queryClient.setQueryData([BOOKS], (oldData) => ([...oldData, data]))
          success = true
          console.log('success')
        }
      })

      console.log('success', success, event)

      return success ? event : {}
    }
    //予約編集
    else {
      var success = false;
      await editMutation.mutateAsync({ id, title, start, end }, {
        onSuccess: () => {
          //この書き方はuseQueryを動かせない、自動的にRerenderさせない
          // queryClient.setQueryData([BOOKS, { id: data.id }], data);
          success = true;
        }
      })

      return success ? event : {}
    }
  }

  //予約削除
  const onDelete = async (eventId) => {
    await deleteMutation.mutateAsync({ id: eventId }, {
      onSuccess: () => {
        queryClient.setQueryData([BOOKS], (oldData) => oldData.filter(r => r.id != eventId));
      }
    })
  }

  return (
    <section className='w-full'>
      <Scheduler
        onConfirm={onConfirm}
        onDelete={onDelete}
        view="week"
        getRemoteEvents={() => refechBooks().then(res => res.data)}
      />
    </section>);
};


export default Home