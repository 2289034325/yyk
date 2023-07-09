"use client"

import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import FullCalendar from '@fullcalendar/react'; // must go before plugins
import timeGridPlugin from '@fullcalendar/timegrid';
import { Alert, Snackbar, Avatar, Box, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSession } from "next-auth/react";
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import Appointment from '../components/appointment';
import { BOOKS, DEFAULT_BOOKABLE } from '../services/cache';
import { useAuthContext } from '../components/provider/auth';


const Home = () => {
  // const { data: session } = useSession();

  const { user, token } = useAuthContext()

  const [showAptDlg, setShowAptDlg] = useState(false)
  const [aptOption, setAptOption] = useState('')
  const [editingApt, setEditingApt] = useState({})

  const [calenderView, setCalenderView] = useState('timeGridWeek');

  //操作結果メッセージ
  const [sbState, setSbState] = useState({
    sbOpen: false,
    sbSeverity: 'success',
    sbMessage: ''
  });
  const { sbMessage, sbSeverity, sbOpen } = sbState;

  //曜日別予約可能時間設定を取得
  const getDefaultBookable = async () => {
    const response = await fetch(`http://localhost:3000/api/setting/default`, {
      method: "GET",
      headers:
      {
        'Authorization': 'Bearer ' + token,
      },
    });
    const data = await response.json();
    // const nd = data.map(d => ({ day: d.day, spans: d.spans.map(s => ({ start: dayjs(`${s.startH}:${s.startM}`, "HH:mm"), end: dayjs(`${s.endH}:${s.endM}`, "HH:mm") })) }))
    // setNewSettings(nd)

    return data;
  }

  //予約すみデータを取得する
  const getBooks = async () => {
    const response = await fetch(`http://localhost:3000/api/book`,
      {
        method: "GET",
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
    const data = await response.json();

    return data;
  }

  //予約追加
  const addBook = async (params) => {
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
    return fetch(`http://localhost:3000/api/book`, {
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
    const token = user?.token;
    await fetch(`http://localhost:3000/api/book?id=${params.id}`, {
      method: "DELETE",
      headers: {
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(params)
    });
  }


  // const queryClient = useQueryClient()
  const calendarRef = useRef(null);

  // データ操作
  const { data: books, refetch: refechBooks } = useQuery([BOOKS], getBooks, {
    refetchOnWindowFocus: false,
    //enabled: false // disable this query from automatically running
  });

  const dboToEntity = (dbo) => {
    //自分の予約は普通のEventとして表示
    if (dbo.userId == user?.id || user?.role == 'admin')
      return {
        id: dbo.id,
        title: dbo.title,
        start: dbo.start,
        end: dbo.end,
        userId: dbo.userId,
        userName: dbo.userName
      }

    //他人の予約はBackground Eventとして表示
    return {
      id: dbo.id,
      title: dbo.title,
      start: dbo.start,
      end: dbo.end,
      userId: dbo.userId,
      userName: dbo.userName,
      display: 'background',
      backgroundColor: '#6b6a6a'
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
    if (!books)
      return []

    const bs = books.map(b => dboToEntity(b))

    //月ビューかつユーザは管理員以外の場合、他人の予約は非表示    
    if (calendarRef.current?.getApi().view.type == "dayGridMonth" && user?.role != 'admin') {
      return bs.filter(b => b.userId == user?.id)
    }

    return bs
  }, [books, user])

  const { data: bookables, refetch: refechBookable } = useQuery([DEFAULT_BOOKABLE], getDefaultBookable, {
    refetchOnWindowFocus: false,
    // enabled: false, // disable this query from automatically running
    cacheTime: 10,
    initialData: []
  });

  const businessHours = useMemo(() => {
    if (!bookables)
      return []

    //予約できる時間帯を取得
    const hs = bookables.map(b => b.spans.map(s => (
      {
        daysOfWeek: [b.day],
        startTime: s.start,
        endTime: s.end
      }))
    ).flat()

    // console.log(hs)

    return hs

  }, [bookables])

  const addMutation = useMutation(addBook);
  const editMutation = useMutation(editBook);
  const deleteMutation = useMutation(deleteBook);


  useEffect(() => {
    refechBooks()
    refechBookable()
  }, [refechBooks, refechBookable])

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


  //指定時間帯が予約可能かどうか
  const isBookable = useCallback((datetime) => {
    if (!bookables)
      return false

    const day = datetime.getDay()
    const cellTimeStart = dayjs(dayjs(datetime).format("HH:mm"), "HH:mm")

    //デフォールト値が設定されていない場合、予約不可
    const spans = bookables.find(r => r.day == day)?.spans
    if (!spans)
      return false

    if (!spans.find(s =>
      (cellTimeStart.isAfter(dayjs(s.start, "HH:mm")) || cellTimeStart.isSame(dayjs(s.start, "HH:mm"))) &&
      (cellTimeStart.isBefore(dayjs(s.end, "HH:mm")) || cellTimeStart.isSame(dayjs(s.end, "HH:mm")))))
      return false

    //予約済みの場合、予約不可
    if (bookData.find(b =>
      (dayjs(datetime).isAfter(dayjs(b.start)) || dayjs(datetime).isSame(dayjs(b.start))) &&
      (dayjs(datetime).isBefore(dayjs(b.end)))))
      return false

    return true
  }, [bookables, bookData])

  //予約新規
  const cellClick = useCallback((e) => {
    console.log(e)
    // e.jsEvent.detail == 2
    // console.log(e)

    //MonthViewの場合、何もしない
    if (e.view.type == 'dayGridMonth')
      return

    //予約できる判断
    if (!isBookable(e.date))
      return

    setEditingApt({ id: uuid(), title: '', start: e.date, end: dayjs(e.date).add(1, 'hour') })
    setAptOption('ADD')
    setShowAptDlg(true)
  }, [isBookable])

  //予約変更
  const eventClick = useCallback((e) => {
    const evt = { id: e.event.id, title: e.event.title, start: e.event.start, end: e.event.end }
    console.log(evt)

    //自分の予約のみ変更可能
    if (e.event.extendedProps.userId != user?.id)
      return

    setEditingApt(evt)
    setAptOption('EDIT')
    setShowAptDlg(true)
  }, [user])

  //予約移動
  const eventDrop = useCallback(async (e) => {
    //新しい時間に移動可能チェック
    const toDay = e.event.start.getDay()
    const toStart = dayjs(dayjs(e.event.start).format("HH:mm"), "HH:mm")
    const toEnd = dayjs(dayjs(e.event.end).format("HH:mm"), "HH:mm")
    const spans = bookables.find(r => r.day == toDay)?.spans
    if (!spans?.find(s =>
      (toStart.isAfter(dayjs(s.start, "HH:mm")) || toStart.isSame(dayjs(s.start, "HH:mm"))) &&
      (toEnd.isBefore(dayjs(s.end, "HH:mm")) || toEnd.isSame(dayjs(s.end, "HH:mm")))))
      return e.revert()

    var success = false;
    // const newEvt = { id: e.oldEvent.id, title: e.oldEvent.title, start: e.event.start, end: e.event.end }
    const newEvt = { id: e.event.id, title: e.event.title, start: e.event.start, end: e.event.end }
    await editMutation.mutateAsync(newEvt, {
      onSuccess: (res) => {
        console.log(res)
        //この書き方はuseQueryを動かせない、自動的にRerenderさせない
        // queryClient.setQueryData([BOOKS, { id: data.id }], data);
        if (res.ok)
          success = true;
        else
          setSbState({ sbSeverity: 'error', sbOpen: true, sbMessage: res.text() })
      }
    })

    if (!success)
      e.revert()
  }, [bookables])


  const AppointOptFinished = () => {

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
  // const WeekViewTimeCell = props => {
  //   const cell = <WeekView.TimeTableCell {...props} onDoubleClick={(e) => addAppointment(props)} />

  //   return cell
  // };

  // slotLaneClassNames is for the whole line, not every cell
  const getTimeCellClassName = (e) => {
    // console.log(e, '......................')
    // if (e.date.getDay() == 1 && e.date.getHours() == 8)
    //   console.log('8888888888888')
    // if (isBookable(e.date))
    //   return "bg-blue-200"
    // else
    //   return "bg-gray-300"
  }

  const renderEventContent = useCallback((eventInfo) => {
    console.log(eventInfo)

    //月ビュー
    if (eventInfo.view.type == "dayGridMonth") {
      return (
        <Box className='flex flex-row h-full w-full items-center bg-blue-500'>
          <Avatar className='w-[16px] h-[16px] mx-1 text-xs'>{eventInfo.event.extendedProps.userName?.substring(0, 1)}</Avatar>
          <Typography className='flex-1 text-sm text-ellipsis whitespace-nowrap overflow-hidden text-white' >{eventInfo.event.title}</Typography>
        </Box>
      )
    }

    //週ビュー
    //他のユーザの予約はBackground Eventとして表示
    if (eventInfo.event.extendedProps.userId != user?.id && user?.role != 'admin')
      return (<></>)

    return (
      <Box className='flex flex-row h-full w-full items-center ml-[-1px] mt-[-1px]'>
        <Avatar className='w-[32px] h-[32px] mx-1'>{eventInfo.event.extendedProps.userName?.substring(0, 1)}</Avatar>
        <Typography className='flex-1 text-ellipsis whitespace-nowrap overflow-hidden' >{eventInfo.event.title}</Typography>
      </Box>)
  }, [user])

  const slotLabelClassNamesHook = useCallback(() => { return ['text-gray-400'] }, [])

  const headerToolbar = useRef({
    left: 'today prev,next',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek'
  })

  const closeBookEditor = useCallback(() => setShowAptDlg(false), [])

  const closeSnackbar = useCallback(() => setSbState({ ...sbState, sbOpen: false }), [sbState])

  const calenderPlugins = useRef([dayGridPlugin, timeGridPlugin, interactionPlugin])

  return (
    <>
      <FullCalendar
        ref={calendarRef}
        height='100%'
        initialView="timeGridWeek"
        headerToolbar={headerToolbar.current}
        eventContent={renderEventContent}
        editable={true}
        slotLabelClassNames={slotLabelClassNamesHook}
        //not fired if drop to same place as drag from
        eventDrop={eventDrop}
        //always fire wherever it drops
        // eventDragStop={() => { }}
        eventDurationEditable={false}
        plugins={calenderPlugins.current}
        events={bookData}
        // slotLaneClassNames={getTimeCellClassName}
        dateClick={cellClick}
        businessHours={businessHours}
        allDaySlot={false}
        eventClick={eventClick}
      />
      {showAptDlg &&
        <Appointment
          isOpen={showAptDlg}
          apt={editingApt}
          option={aptOption}
          handleClose={closeBookEditor}
          handleFinish={AppointOptFinished} />}

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={sbOpen}
        onClose={closeSnackbar}
        message={sbMessage}
        autoHideDuration={2000}
      >
        <Alert severity={sbSeverity} className='w-full'>
          {sbMessage}
        </Alert>
      </Snackbar>
    </>);
};


export default Home