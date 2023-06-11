import React from 'react'
import Modal from 'react-modal';

const Login = () => {
    return (
        <Modal isOpen={modalIsOpen}>
            <div>
                <input placeholder='ユーザ名' />
                <input placeholder='パスワード' />
                <button value='ログイン' />
            </div>
        </Modal>
    )
}

export default Login