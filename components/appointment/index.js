import EastIcon from '@mui/icons-material/East';
import { Alert, Box, Button, Snackbar, Stack, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { TimeField } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useMutation } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { useState } from 'react';
import { useAuthContext } from '../provider/auth';

const Appointment = ({ isOpen, option, apt, handleClose, handleFinish }) => {
    // const { data: session } = useSession()

    const { token } = useAuthContext()

    const [newApt, setNewApt] = useState(apt)

    //操作結果メッセージ
    const [sbState, setSbState] = useState({
        sbOpen: false,
        sbSeverity: 'success',
        sbMessage: ''
    });
    const { sbMessage, sbSeverity, sbOpen } = sbState;

    //予約追加
    const addBook = async (params) => {
        return fetch(`http://localhost:3000/api/book`,
            {
                method: "POST",
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify(params)
            });
    }

    //予約変更
    const editBook = async (params) => {
        return fetch(`http://localhost:3000/api/book`,
            {
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
        return fetch(`http://localhost:3000/api/book?id=${params.id}`,
            {
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

    //新規・編集
    const confirm = async () => {
        let success = false;
        if (option == 'ADD') {
            await addMutation.mutateAsync(newApt, {
                onSuccess: (res) => {
                    console.log(res)
                    //この書き方はuseQueryを動かして、RerenderもFired
                    // queryClient.setQueryData([BOOKS], (oldData) => ([...oldData, data]))
                    if (res.ok && !res.error)
                        success = true
                    else
                        setSbState({ ...sbState, sbSeverity: 'error', sbOpen: true, sbMessage: res.error })
                }
            })
        }
        else {
            await editMutation.mutateAsync(newApt, {
                onSuccess: (res) => {
                    //この書き方はuseQueryを動かして、RerenderもFired
                    // queryClient.setQueryData([BOOKS], (oldData) => ([...oldData, data]))
                    if (res.ok && !res.error)
                        success = true
                    else
                        setSbState({ ...sbState, sbSeverity: 'error', sbOpen: true, sbMessage: res.error })
                }
            })
        }

        if (success)
            handleFinish()
    }

    //削除
    const onDelete = async () => {
        let success = false;
        await deleteMutation.mutateAsync(newApt, {
            onSuccess: (res) => {
                //この書き方はuseQueryを動かして、RerenderもFired
                // queryClient.setQueryData([BOOKS], (oldData) => ([...oldData, data]))
                if (res.ok && !res.error)
                    success = true
                else
                    setSbState({ ...sbState, sbSeverity: 'error', sbOpen: true, sbMessage: res.error })
            }
        })

        if (success)
            handleFinish()
    }

    return (
        <>
            <Dialog open={isOpen}>
                <DialogTitle>{option == 'ADD' ? '新規予約' : '予約変更'}</DialogTitle>
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
                    {option == 'EDIT' &&
                        <Button color='error' onClick={onDelete}>Delete</Button>
                    }
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={confirm}>Confirm</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                open={sbOpen}
                onClose={() => { setSbState({ ...sbState, sbOpen: false }) }}
                message={sbMessage}
                autoHideDuration={2000}
            >
                <Alert severity={sbSeverity} sx={{ width: '100%' }}>
                    {sbMessage}
                </Alert>
            </Snackbar>
        </>

    )
}

export default Appointment