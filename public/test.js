// // 定义异步生成器
// async function* asyncGen() {
//   while (true) {
//     yield "红灯";
//     await new Promise((r) => setTimeout(r, 1000));
//     yield "黄灯";
//     await new Promise((r) => setTimeout(r, 500));
//     yield "绿灯";
//     await new Promise((r) => setTimeout(r, 1000));
//   }
// }

// // 使用
// for await (const item of asyncGen()) {
//   console.log(item); // 输出: 1, 2, 3
// }

// ❌ 这不行！
const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];

for await (const item of promises) {
  console.log(item);
  // 输出: Promise { 1 }
  //       Promise { 2 }
  //       Promise { 3 }
  // 得到的是 Promise 对象，不是值！
}
