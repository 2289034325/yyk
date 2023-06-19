// import { useSession } from "next-auth/react";


// const { data: session } = useSession();

// //予約すみデータを取得する
// export const getBooks = async () => {
//     const response = await fetch(`/api/book`, { method: "GET" });
//     const data = await response.json();
//     return data;
// }

// //予約追加
// export const addBook = async (params) => {
//     const token = session.user.token;
//     const response = await fetch(`/api/book`, {
//         method: "POST",
//         headers: {
//             'Authorization': 'Bearer ' + token,
//         },
//         body: JSON.stringify(params)
//     });
//     const data = await response.json();

//     return data;
// }

// //予約変更
// export const editBook = async (params) => {
//     const token = session.user.token;
//     const response = await fetch(`/api/book`, {
//         method: "PUT",
//         headers: {
//             'Authorization': 'Bearer ' + token,
//         },
//         body: JSON.stringify(params)
//     });
//     const data = await response.json();

//     return data;
// }

// //予約削除
// //nextjs bug
// //next api always ignore request body.
// //passing id from url params to solve the problem.
// //or using dynamic path api
// export const deleteBook = async (params) => {
//     const token = session.user.token;
//     await fetch(`/api/book?id=${params.id}`, {
//         method: "DELETE",
//         headers: {
//             'Authorization': 'Bearer ' + token,
//         },
//         body: JSON.stringify(params)
//     });
// }

// //曜日別予約可能時間設定を取得
// export const getDefaultBookable = async () => {
//     const response = await fetch(`/api/setting/default`, { method: "GET" });
//     const data = await response.json();
//     return data;
// }

// //曜日別予約可能時間設定を編集
// export const setDefaultBookable = async (params) => {
//     const token = session.user.token;
//     const response = await fetch(`/api/book`, {
//         method: "PUT",
//         headers: {
//             'Authorization': 'Bearer ' + token,
//         },
//         body: JSON.stringify(params)
//     });
//     await response.json();
// }