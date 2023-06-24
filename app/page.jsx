"use client"

import { BOOKS, DEFAULT_BOOKABLE } from '@services/cache';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import Appointment from '@components/appointment';
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction" // needed for dayClick
import timeGridPlugin from '@fullcalendar/timegrid'

const Home = () => {
  const { data: session } = useSession();

  const [showAptDlg, setShowAptDlg] = useState(false)
  const [aptOption, setAptOption] = useState('')
  const [editingApt, setEditingApt] = useState({})

  //曜日別予約可能時間設定を取得
  const getDefaultBookable = async () => {
    const response = await fetch(`http://localhost:3000/api/setting/default`, { method: "GET" });
    const data = await response.json();
    // const nd = data.map(d => ({ day: d.day, spans: d.spans.map(s => ({ start: dayjs(`${s.startH}:${s.startM}`, "HH:mm"), end: dayjs(`${s.endH}:${s.endM}`, "HH:mm") })) }))
    // setNewSettings(nd)

    return data;
  }

  //予約すみデータを取得する
  const getBooks = async () => {
    const response = await fetch(`http://localhost:3000/api/book`, { method: "GET" });
    const data = await response.json();

    // const bookData = data.map(d => { return { event_id: d.id, title: d.title, start: new Date(d.start), end: new Date(d.end) } })
    console.log(data)
    return data;
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
  const { data: books, refetch: refechBooks } = useQuery([BOOKS], getBooks, {
    refetchOnWindowFocus: false,
    //enabled: false // disable this query from automatically running
  });

  useEffect(() => {
    refechBooks()
  }, [])

  const dboToEntity = (dbo) => {
    return {
      id: dbo.id,
      title: dbo.title,
      start: dbo.start,
      end: dbo.end
    }
  }

  const entityToDbo = (entity) => {
    return {
      id: entity.id,
      title: entity.title,
      start: entity.start,
      end: entity.end
    }
  }

  const bookData = useMemo(() => {
    console.log(books)
    if (!books)
      return []

    return books.map(b => dboToEntity(b))
  }, [books])

  const { data: bookables, refetch: refechBookable } = useQuery([DEFAULT_BOOKABLE], getDefaultBookable, {
    refetchOnWindowFocus: false,
    // enabled: false, // disable this query from automatically running
    cacheTime: 10,
    initialData: []
  });
  const addMutation = useMutation(addBook);
  const editMutation = useMutation(editBook);
  const deleteMutation = useMutation(deleteBook);

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
        }
      })

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
    var success = false;
    await deleteMutation.mutateAsync({ id: eventId }, {
      onSuccess: () => {
        // queryClient.setQueryData([BOOKS], (oldData) => oldData.filter(r => r.id != eventId));
        success = true;
      }
    })

    return success ? eventId : null
  }

  const checkTimeIsIn = (startH, startM, endH, endM, sH, sM, eH, eM) => {
    const startP = startH + startM / 100
    const endP = endH + endM / 100
    const sP = sH + sM / 100
    const eP = eH + eM / 100

    console.log(startH, startM, endH, endM, sH, sM, eH, eM)
    console.log(startP, endP, sP, eP)

    return sP >= startP && eP <= endP
  }

  const addAppointment = (e) => {

    console.log(e)
    setEditingApt({ id: uuid(), title: '', start: e.date, end: dayjs(e.date).add(1, 'hour') })
    setAptOption('新規予約')
    setShowAptDlg(true)
  }

  const AppointEditFinished = () => {

    setShowAptDlg(false)
    refechBooks()
  }

  // const tLabel = props => {
  //   if (props.time)
  //     return <WeekView.TimeScaleLabel
  //       {...props}
  //       style={{ height: '20px', lineHeight: '20px' }}
  //       formatDate={(e) => dayjs(e).format('HH:mm')} />
  //   else
  //     return <WeekView.TimeScaleLabel
  //       {...props}
  //       style={{ height: '10px', lineHeight: '10px' }} />
  // }
  // const tTick = props => (<WeekView.TimeScaleTickCell {...props} style={{ height: '20px' }} />);
  const WeekViewTimeCell = props => {
    const cell = <WeekView.TimeTableCell {...props} onDoubleClick={(e) => addAppointment(props)} />

    return cell
  };

  return (
    <section className='flex-1 w-full overflow-y-auto'>
      <FullCalendar
        height='100%'
        initialView="timeGridWeek"
        plugins={[timeGridPlugin, interactionPlugin]}
        events={bookData}
        dateClick={(e) => { if (e.jsEvent.detail == 2) addAppointment(e) }}

      />
      {showAptDlg &&
        <Appointment
          isOpen={showAptDlg}
          apt={editingApt}
          option={aptOption}
          handleClose={() => setShowAptDlg(false)}
          handleConfirm={AppointEditFinished} />}
    </section>);
};


export default Home