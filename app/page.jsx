"use client"

import { useEffect, useMemo, useLayoutEffect, useCallback, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Scheduler } from '@aldabil/react-scheduler';
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
import { BOOKS } from '@services/cache';
import { addBook, deleteBook, editBook, getBooks } from '@services/api';

const Home = () => {
  const { data: session } = useSession();


  //予約すみデータを取得する
  const getBooks = async () => {
    const response = await fetch(`/api/book`, { method: "GET" });
    const data = await response.json();
    return data;
  }

  //予約追加
  const addBook = async (params) => {
    const token = session.user.token;
    const response = await fetch(`/api/book`, {
      method: "POST",
      headers: {
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(params)
    });
    const data = await response.json();

    return data;
  }

  //予約変更
  const editBook = async (params) => {
    const token = session.user.token;
    const response = await fetch(`/api/book`, {
      method: "PUT",
      headers: {
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(params)
    });
    const data = await response.json();

    return data;
  }

  //予約削除
  //nextjs bug
  //next api always ignore request body.
  //passing id from url params to solve the problem.
  //or using dynamic path api
  const deleteBook = async (params) => {
    const token = session.user.token;
    await fetch(`/api/book?id=${params.id}`, {
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
  const { data: bookData } = useQuery([BOOKS], getBooks);
  const addMutation = useMutation(addBook);
  const editMutation = useMutation(editBook);
  const deleteMutation = useMutation(deleteBook);

  // データのフォーマット
  const books = useMemo(() => {
    if (!Array.isArray(bookData))
      return [];

    const bs = bookData.map(d => { return { event_id: d.id, title: d.title, start: new Date(d.start), end: new Date(d.end) } })
    calendarRef.current.scheduler.handleState(bs, "events");

    return bs;
  }, [bookData]);

  //予約確認ボタン処理
  const onConfirm = async (event, action) => {
    const { event_id: id, title, start, end } = event;

    //予約追加
    if (action === 'create') {
      await addMutation.mutateAsync({ title, start, end }, {
        onSuccess: (data) => {
          //この書き方はuseQueryを動かして、RerenderもFired
          queryClient.setQueryData([BOOKS], (oldData) => ([...oldData, data]))
        }
      })

      return {}
    }
    //予約編集
    else {
      var success = false;
      await editMutation.mutateAsync({ id, title, start, end }, {
        onSuccess: (data) => {
          //この書き方はuseQueryを動かせない、自動的にRerenderさせない
          queryClient.setQueryData([BOOKS, { id: data.id }], data);
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
        ref={calendarRef}
        onConfirm={onConfirm}
        onDelete={onDelete}
        view="week"
        events={books}
      />
    </section>);
};


export default Home