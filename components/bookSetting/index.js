import { Button, Chip, Stack } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import TimeSpanSetting from '../../components/timespan';
import { DEFAULT_BOOKABLE } from '../../services/cache';

//曜日別予約可能時間設定
const BookSetting = ({ isOpen, handleClose }) => {

    const { data: session } = useSession();

    //曜日別予約可能時間設定を取得
    const getDefaultBookable = async () => {
        const response = await fetch(`http://localhost:3000/api/setting/default`, { method: "GET" });
        const data = await response.json();
        const nd = data.map(d => ({ day: d.day, spans: d.spans.map(s => ({ start: dayjs(s.start, "HH:mm"), end: dayjs(s.end, "HH:mm") })) }))
        setNewSettings(nd)

        return data;
    }

    //曜日別予約可能時間設定を編集
    const setDefaultBookable = async (params) => {
        const nds = params.map(p => ({
            day: p.day,
            spans: p.spans.map(s => (
                { start: s.start.format('HH:mm'), end: s.end.format('HH:mm') }))
        }))

        const token = session.user.token;
        await fetch(`http://localhost:3000/api/setting/default`, {
            method: "PUT",
            // headers: {
            //     'Authorization': 'Bearer ' + token,
            // },
            body: JSON.stringify(nds)
        });
    }

    const queryClient = useQueryClient()

    // データ操作
    const [newSettings, setNewSettings] = useState([])
    // const [staticDate] = useState(new Date());
    // const useQuery([DEFAULT_BOOKABLE], {
    //     queryFn: getDefaultBookable,
    //     // variables: {
    //     //     date: staticDate
    //     // },
    //     //ACTODO
    //     //BUG! onCompleted NOT FIRED!
    //     notifyOnNetworkStatusChange: true,
    //     fetchPolicy: 'network-only',
    //     onCompleted: (data) => {
    //         setNewSettings(data)
    //     },
    // });

    const { refetch: refechBookable } = useQuery([DEFAULT_BOOKABLE], getDefaultBookable, {
        refetchOnWindowFocus: false,
        // enabled: false, // disable this query from automatically running
        cacheTime: 10,
        initialData: []
    });

    useEffect(() => {
        refechBookable()
    }, [])

    const setMutation = useMutation(setDefaultBookable);

    //曜日の予約可能時間を取得
    const getDaySpans = (day) => {
        if (!newSettings)
            return []

        const ss = newSettings.find(s => s.day == day)?.spans ?? [];

        return ss;
    }

    //曜日の予約可能時間が変更されました
    const spansChanged = (day, spans) => {
        var ds = newSettings.filter(r => r.day != day)
        setNewSettings([...ds, { day, spans }])
    }

    const confirmSetting = async () => {
        await setMutation.mutateAsync(newSettings, {
            onSuccess: () => {
                //この書き方はuseQueryを動かせない、自動的にRerenderさせない
                // queryClient.setQueryData([DEFAULT_BOOKABLE], (oldData) => (newSettings));
                
                //!!! ACTONTC DEFAULT_BOOKABLEを使っているComponentにrefetchを動かせる
                queryClient.invalidateQueries(DEFAULT_BOOKABLE);
            }
        })

        handleClose();
    }

    return (
        <Dialog open={isOpen}>
            <DialogTitle>時間設定</DialogTitle>
            <DialogContent>
                <Stack direction="column" spacing={2} sx={{ minWidth: '500px' }}>
                    <Stack direction="row">
                        <Chip label="月" />
                        <TimeSpanSetting day={1} spans={getDaySpans(1)} spansChanged={spansChanged} />
                    </Stack>
                    <Stack direction="row">
                        <Chip label="火" />
                        <TimeSpanSetting day={2} spans={getDaySpans(2)} spansChanged={spansChanged} />
                    </Stack>
                    <Stack direction="row">
                        <Chip label="水" />
                        <TimeSpanSetting day={3} spans={getDaySpans(3)} spansChanged={spansChanged} />
                    </Stack>
                    <Stack direction="row">
                        <Chip label="木" />
                        <TimeSpanSetting day={4} spans={getDaySpans(4)} spansChanged={spansChanged} />
                    </Stack>
                    <Stack direction="row">
                        <Chip label="金" />
                        <TimeSpanSetting day={5} spans={getDaySpans(5)} spansChanged={spansChanged} />
                    </Stack>
                    <Stack direction="row">
                        <Chip label="土" />
                        <TimeSpanSetting day={6} spans={getDaySpans(6)} spansChanged={spansChanged} />
                    </Stack>
                    <Stack direction="row">
                        <Chip label="日" />
                        <TimeSpanSetting day={7} spans={getDaySpans(7)} spansChanged={spansChanged} />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={confirmSetting}>Confirm</Button>
            </DialogActions>
        </Dialog>
    )
}

export default BookSetting