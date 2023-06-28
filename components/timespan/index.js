import { Box, Chip } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { TimeField } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useState } from 'react';
import dayjs from 'dayjs';
import { Clear } from '@mui/icons-material';

const TimeSpanSetting = ({ day, spans, spansChanged }) => {
    const [isDlgOpen, setIsDlgOpen] = useState(false)
    const [start, setStart] = useState(dayjs())
    const [end, setEnd] = useState(dayjs())

    //予約可能時間を削除
    const deleteSpan = (span) => {
        var sps = spans.filter(s => s !== span)

        spansChanged(day, sps)
    }

    //予約可能時間を追加
    const confirm = () => {

        var sps = [...spans, { start, end }]

        setStart(end)
        setEnd(end.add(4, 'hour'))

        spansChanged(day, sps)

        setIsDlgOpen(false)
    }

    return (
        <Box alignItems="center" display="flex">
            <Chip
                label="+"
                size="small"
                onClick={() => setIsDlgOpen(true)} />
            <Box marginLeft="10px">
                {spans.map((s, index) => (
                    <Chip
                        key={index}
                        deleteIcon={<Clear />}
                        label={`${s.start.format('HH:mm')}~${s.end.format('HH:mm')}`}
                        onDelete={() => deleteSpan(s)} />
                ))}
            </Box>

            <Dialog open={isDlgOpen} onClose={() => { setIsDlgOpen(false) }}>
                <DialogTitle>時間設定</DialogTitle>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box paddingTop="20px">
                            <TimeField
                                label="開始時間"
                                ampm={false}
                                value={start}
                                onChange={(newValue) => setStart(newValue)}
                            />
                            <TimeField
                                label="終了時間"
                                ampm={false}
                                value={end}
                                onChange={(newValue) => setEnd(newValue)}
                            />
                        </Box>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDlgOpen(false)}>キャンセル</Button>
                    <Button onClick={confirm}>確認</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default TimeSpanSetting