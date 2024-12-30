import { Burrito } from "./index";

const burrito = new Burrito({});

// const each = await burrito.transform({
//   prompt: "What is the meaning of life?",
//   mode: "each",
// });

// const aaaaa = await burrito.transform<string>({
//   prompt: "What is the meaning of life?",
//   mode: "all",
// });

// const aaaaa2 = await burrito.transform({
//   prompt: "What is the meaning of life?",
//   mode: "all",
// });

const transforms = await burrito.getTransforms();
console.log(transforms);
