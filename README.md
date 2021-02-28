# denops-http-request.vim
The http client plugin of vim.
Using [denops.vim](https://github.com/vim-denops/denops.vim).

## Installation
Use your favorite Vim plugin manager.

## Usage
### GET
```
https://example.com
```
```vim
:'<,'>GetRequest
```
with params
```
https://example.com
{
  "hogehoge": "fugafuga"
}
```

### POST
```
https://example.com
{
  "hogehoge": "fugafuga"
}
```
```vim
:'<,'>POSTRequest
```
