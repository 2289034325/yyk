import TimeSpanSetting from '@components/timespan';
import { Button, Chip, Stack } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { DEFAULT_BOOKABLE } from '@services/cache';
import { useSession } from "next-auth/react";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react';
import { Dashboard } from '@mui/icons-material';
import dayjs from 'dayjs';

//曜日別予約可能時間設定
const BookSetting = ({ isOpen, handleClose }) => {

    const { data: session } = useSession();

    //曜日別予約可能時間設定を取得
    const getDefaultBookable = async () => {
        const response = await fetch(`/api/setting/default`, { method: "GET" });
        const data = await response.json();
        const nd = data.map(d => ({ day: d.day, spans: d.spans.map(s => ({ start: dayjs(`${s.startH}:${s.startM}`, "HH:mm"), end: dayjs(`${s.endH}:${s.endM}`, "HH:mm") })) }))
        setNewSettings(nd)

        return data;
    }

    //曜日別予約可能時間設定を編集
    const setDefaultBookable = async (params) => {
        const nds = params.map(p => ({
            day: p.day,
            spans: p.spans.map(s => (
                { startH: s.start.$H, startM: s.start.$m, endH: s.end.$H, endM: s.end.$m }))
        }))

        const token = session.user.token;
        await fetch(`/api/setting/default`, {
            method: "PUT",
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify(nds)
        });
    }

    const queryClient = useQueryClient()

    // データ操作
    const [newSettings, setNewSettings] = useState([])
    const [staticDate] = useState(new Date());
    useQuery([DEFAULT_BOOKABLE], {
        queryFn: getDefaultBookable,
        variables: {
            date: staticDate
        },
        //ACTODO
        //BUG! onCompleted NOT FIRED!
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            setNewSettings(data)
        },
    });

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
        console.log('confirm.......')
        const newSetting = [];
        await setMutation.mutateAsync(newSettings, {
            onSuccess: () => {
                //この書き方はuseQueryを動かせない、自動的にRerenderさせない
                queryClient.setQueryData([DEFAULT_BOOKABLE], (oldData) => (newSetting));
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