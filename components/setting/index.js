import React from 'react'
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TimeSpanSetting from '@components/timespan';
import { Chip, Stack } from '@mui/material';

const BookSetting = () => {
    return (
        <Stack direction="column" spacing={2} sx={{ minWidth: '500px' }}>
            <Stack direction="row">
                <Chip label="月" />
                <TimeSpanSetting />
            </Stack>
            <Stack direction="row">
                <Chip label="火" />
                <TimeSpanSetting />
            </Stack>
            <Stack direction="row">
                <Chip label="水" />
                <TimeSpanSetting />
            </Stack>
            <Stack direction="row">
                <Chip label="木" />
                <TimeSpanSetting />
            </Stack>
            <Stack direction="row">
                <Chip label="金" />
                <TimeSpanSetting />
            </Stack>
            <Stack direction="row">
                <Chip label="土" />
                <TimeSpanSetting />
            </Stack>
            <Stack direction="row">
                <Chip label="日" />
                <TimeSpanSetting />
            </Stack>
        </Stack>
    )
}

export default BookSetting