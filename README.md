# study-repository

Kho du lieu hoc tap theo kieu static data server. Nhanh `main` luu du lieu goc, CI/CD build sang nhanh `public` de phuc vu GitHub Pages.

## Cau truc du lieu (moi)

```text
data/
  <Faculty>/
    <Course>/
      info.json
      thumbnail.jpg|png|webp|jpeg
      [docs]/
        <doc-slug>/
          info.json
          content.md | content.pdf
          ...attachments
      [exams]/
        <exam-slug>/
          info.json
          content.md | content.pdf
          ...attachments
      [qa]/
        c1.json
        # hoac
        <qa-slug>/
          info.json
          content.md | content.pdf
          ...attachments
```

`data/_...` se bi bo qua khi build.

## Quy tac bat buoc

1. Moi mon hoc phai co `info.json` tai goc mon va 1 file `thumbnail.*` tai goc mon.
2. `[docs]` va `[exams]` gom cac thu muc con. Moi thu muc con phai co:
   - `info.json`
   - Dung 1 file noi dung: `content.md` hoac `content.pdf`
   - Co the them attachments khac.
3. `[qa]` ho tro 2 kieu:
   - File JSON truc tiep (`c1.json`) cho bo trac nghiem.
   - Hoac thu muc item theo mo hinh `info.json + content.(md|pdf)`.

## Build output

`npm run build` sinh `.dist/`:

- `main.json`: danh sach mon hoc
- `courses/<Course>.json`: metadata chi tiet docs/exams/qa
- `stats.json`: thong ke tong hop
- `search-index.json`: catalog tim kiem
- `search/`: index tim kiem full-text prebuilt
- `last_update.json`: timestamp + epoch de cache invalidation
- `data/`: copy du lieu goc (bo qua cac folder bat dau bang `_`)

## Scripts

- `npm run lint`: validate format du lieu
- `npm run build`: build ra `.dist`
- `npm run check`: lint + build (dung cho CI/CD)
- `npm run dev`: alias cua build local

## CI/CD

### PR (`.github/workflows/pr-check.yml`)

- Validate PR template checkbox
- Chay `npm run lint`
- Chay `npm run build`
- Verify file output: `main.json`, `courses/`, `data/`, `stats.json`, `search-index.json`, `last_update.json`

### Deploy (`.github/workflows/deploy.yml`)

- Trigger khi push vao `main`
- Chay `npm run check`
- Deploy `.dist` sang nhanh `public`

## Mau du lieu

Dung `data/_ExamMajor/Example` lam mau khi tao mon moi.

## Contributing

Huong dan dong gop chi tiet da duoc tach ra file rieng:

- `CONTRIBUTING.md`
