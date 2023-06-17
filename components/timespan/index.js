import { Box, Chip } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useState } from 'react';

const TimeSpanSetting = () => {

    const [spans, setSpans] = useState([])
    const [isDlgOpen, setIsDlgOpen] = useState(false)

    const addSpan = () => {
        setIsDlgOpen(true)
    }

    const confirm = () => {

    }

    return (
        <Box alignItems="center" display="flex">
            <Chip
                label="+"
                size="small"
                onClick={addSpan} />
            <div>
                {spans.map(s => {
                    <span>{`${s.start}~${s.end}`}</span>
                })}
            </div>

            <Dialog open={isDlgOpen} onClose={() => { setIsDlgOpen(false) }}>
                <DialogTitle>時間設定</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        開始時間と終了時間を設定してください
                    </DialogContentText>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker /><TimePicker />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDlgOpen(false)}>Cancel</Button>
                    <Button onClick={confirm}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default TimeSpanSetting