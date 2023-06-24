import { Input, TextFields } from '@mui/icons-material';
import { Button, Chip, Stack, Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { TimeField } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useSession } from "next-auth/react";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import EastIcon from '@mui/icons-material/East';

const Appointment = ({ isOpen, option, apt, handleClose, handleConfirm }) => {
    const { data: session } = useSession()

    const [newApt, setNewApt] = useState(apt)

    //予約追加
    const addBook = async (params) => {
        console.log(params)

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

    const addMutation = useMutation(addBook);
    const editMutation = useMutation(editBook);
    const deleteMutation = useMutation(deleteBook);

    const confirm = async () => {
        let success = false;
        await addMutation.mutateAsync(newApt, {
            onSuccess: () => {
                //この書き方はuseQueryを動かして、RerenderもFired
                // queryClient.setQueryData([BOOKS], (oldData) => ([...oldData, data]))
                success = true
            }
        })

        if (success)
            handleConfirm()
    }

    return (
        <Dialog open={isOpen}>
            <DialogTitle>{option}</DialogTitle>
            <DialogContent>
                <Stack direction="column" spacing={2} sx={{ minWidth: '500px' }}>
                    <Stack direction="row">
                        <TextField id="standard-basic"
                            label="タイトル"
                            variant="standard"
                            fullWidth
                            value={newApt.title}
                            onChange={(e) => setNewApt({ ...newApt, title: e.target.value })} />
                    </Stack>
                    <Stack direction="row">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Box paddingTop="20px"
                                width="100%"
                                justifyContent="space-between"
                                alignItems="center"
                                display="flex">
                                <TimeField
                                    label="開始時間"
                                    ampm={false}
                                    value={newApt.start}
                                    onChange={(newValue) => setNewApt({ ...newApt, start: newValue })}
                                />
                                <EastIcon />
                                <TimeField
                                    label="終了時間"
                                    ampm={false}
                                    value={newApt.end}
                                    onChange={(newValue) => setNewApt({ ...newApt, end: newValue })}
                                />
                            </Box>
                        </LocalizationProvider>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={confirm}>Confirm</Button>
            </DialogActions>
        </Dialog>
    )
}

export default Appointment