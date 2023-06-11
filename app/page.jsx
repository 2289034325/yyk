"use client"

import { useEffect, useMemo, useLayoutEffect, useCallback, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Scheduler } from '@aldabil/react-scheduler';
import { signIn, signOut, useSession, getProviders } from "next-auth/react";

const Home = () => {
  const { data: session } = useSession();

  const queryClient = useQueryClient()

  const calendarRef = useRef(null);

  //予約すみデータを取得する
  const fetchBooks = async () => {
    const response = await fetch(`/api/book`, { method: "GET" });
    const data = await response.json();
    console.log(data)
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

  // データ操作
  const { data: bookData } = useQuery(["bookdata"], fetchBooks);
  const bookMutation = useMutation(addBook);

  const books = useMemo(() => {
    if (!Array.isArray(bookData))
      return [];

    const bs = bookData.map(d => { return { event_id: d.id, title: d.title, start: new Date(d.start), end: new Date(d.end) } })

    console.log(bs);

    calendarRef.current.scheduler.handleState(bs, "events");


    return bs;
  }, [bookData]);

  useEffect(() => {

  }, [])

  useEffect(() => {

  })

  useLayoutEffect(() => {

  });

  const confirmBook = async (event, action) => {
    const { title, start, end } = event;
    console.log(event)
    if (action === 'create') {
      await bookMutation.mutateAsync({ title, start, end }, {
        onSuccess: (data) => {
          queryClient.setQueryData(['bookdata'], (oldData) => ([...oldData, data]))
        }
      })

      return {}
    }
    else {

    }
  }

  // const confirmBook = useCallback(async (event, action) => {
  //   const { title, start, end } = event;
  //   console.log(bookData, '----------------------')
  //   console.log(books, '----------------------')
  //   if (action === 'create') {
  //     await bookMutation.mutateAsync({ title, start, end }, {
  //       onSuccess: (data) => {
  //         console.log(bookData, '----------------------')
  //         // queryClient.setQueryData(['bookdata'], [...bookData, data])
  //       }
  //     })

  //     return {}
  //   }
  //   else {

  //   }
  // }, [bookData])

  return (
    <section className='w-full'>
      <Scheduler
        ref={calendarRef}
        onConfirm={confirmBook}
        view="week"
        events={books}
      />
    </section>);
};


export default Home