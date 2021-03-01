import { start } from "https://deno.land/x/denops_std@v0.2/mod.ts";
import ky from "https://cdn.skypack.dev/ky?dts";

start(async (vim) => {
  async function getVisualSelection() {
    const start = (await vim.call("getpos", "'<")) as Array<number>;
    const end = (await vim.call("getpos", "'>")) as Array<number>;
    const line1 = start[1];
    const col1 = start[2];
    const line2 = end[1];
    const col2 = end[2];
    var lines = (await vim.call("getline", line1, line2)) as Array<string>;
    lines[0] = lines[0].slice(col1 - 1);
    lines[lines.length - 1] = lines[lines.length - 1].slice(0, col2);
    return lines;
  }

  vim.register({
    async getRequest(): Promise<void> {
      const texts = await getVisualSelection();
      const url = texts[0];
      if (!isURL(url)) {
        throw new Error(`${url} is not URL`);
      }

      const params =
        texts.length == 1 ? {} : JSON.parse(texts.slice(1).join(""));

      await vim.cmd("enew");
      if (Object.keys(params).length > 0) {
        const info = [`GET ${url}`, "Params:"].concat(
          JSON.stringify(params, null, 2).split("\n")
        );
        await vim.call("append", "0", info);
      } else {
        await vim.call("append", 0, `GET ${url}`);
      }
      const res = await getRequest(url, params);
      const result = ["Result:"].concat(
        JSON.stringify(res, null, 2).split("\n")
      );
      await vim.call("append", "$", result);
    },

    async postRequest(): Promise<void> {
      const texts = await getVisualSelection();
      const url = texts[0];
      if (!isURL(url)) {
        throw new Error(`${url} is not URL`);
      }

      const params =
        texts.length == 1 ? {} : JSON.parse(texts.slice(1).join(""));

      await vim.cmd("enew");
      const info = [`POST ${url}`, "Params:"].concat(
        JSON.stringify(params, null, 2).split("\n")
      );
      await vim.call("append", 0, info);

      const res = await postRequest(url, params);
      const result = ["Result:"].concat(
        JSON.stringify(res, null, 2).split("\n")
      );
      await vim.call("append", "$", result);
    },
  });

  await vim.execute(`
    command! -range GetRequest call denops#request('${vim.name}', 'getRequest', [])
    command! -range PostRequest call denops#request('${vim.name}', 'postRequest', [])
  `);
});

function isURL(url: string) {
  const re = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=~]*)?/;
  return url.match(re) !== null;
}

async function getRequest(
  url: string,
  params: { [key: string]: string | number | boolean } = {}
) {
  const res = await ky.get(url, { searchParams: params }).json();
  return res;
}

async function postRequest(url: string, params: Record<string, unknown>) {
  const res = await ky.post(url, { json: params }).json();
  return res;
}
