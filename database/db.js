import { v4 as uuid } from 'uuid';

const db = {
    users: [{ id: '1', email: 'ngjc250@gmail.com', password: '123456', name: 'tom', role: 'admin', disabled: false }, { id: '2', email: 'ngjc250@hotmail.com', password: '123456', name: 'jim', role: 'user', disabled: false }],
    booked: [],
    defaultBookable: [
        { day: 1, spans: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
        { day: 2, spans: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
        { day: 3, spans: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
        { day: 4, spans: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
        { day: 5, spans: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
        { day: 6, spans: [] },
        { day: 0, spans: [] }],
    specialBookable: [{ date: '', start: '', end: '', disable: false }]
}

//ログインチェック
export function authenticate(email, password) {
    return db.users.find(u => u.email == email && u.password == password && !u.disabled)
}

//会員登録
export function logon(email, password, name) {
    const nu = { id: uuid(), email, password, name, admin: false, disabled: false };
    db.users.push(nu);

    return nu;
}

//アカウントログイン禁止
export function banUser(email) {
    const u = db.users.filter(u => u.email == email);
    u.disabled = true;
}

//予約可能時間設定（曜日、時間）
export function setDefaultBookable(settings) {
    db.defaultBookable = settings;
}

//普通時間以外の予約可能枠を追加
export function addSpecialBookable(start, end) {
    db.specialBookable.push({ id: uuid(), start, end });
}

export function getDefaultBookable() {
    return db.defaultBookable;
}

export function getSpecialBookable(start) {
    return db.specialBookable.filter(b => b.start >= start);
}

//指定期間の予約を取得
export function getBooked(start, end) {
    let nbs = db.booked.map(b => ({
        ...b,
        userName: db.users.find(u => u.id == b.userId)?.name
    }));

    if (start)
        nbs = nbs.filter(b => b.start >= start);
    if (end)
        nbs = nbs.filter(b => b.end <= end);

    return nbs;
}

//指定時間帯と重なる予約を取得
export function getBookedCrossTime(start, end, expId) {
    //終了時間は指定時間帯に含む予約を取得
    const nbs = db.booked.filter(b => b.end > start && b.end <= end && b.id != expId);

    //開始時間は指定時間帯に含む予約を取得
    const nbs2 = db.booked.filter(b => b.start >= start && b.start < end && b.id != expId);

    console.log(start, end, nbs, nbs2)

    return [...nbs, ...nbs2];
}

//生徒予約追加
export function addBook(userId, id, title, start, end) {
    const b = { id, userId, title, start, end };
    db.booked.push(b)
}

export function getBook(id) {
    return db.booked.find(r => r.id == id)
}

//生徒予約変更
export function editBook(id, title, start, end) {
    const b = db.booked.find(r => r.id == id);
    b.title = title;
    b.start = start;
    b.end = end;
}

//生徒予約削除
export function deleteBook(id) {
    db.booked = db.booked.filter(b => b.id != id);
}

export function editUserInfo(id, name) {
    const user = db.users.find(r => r.id == id)
    user.name = name

    return user
}


