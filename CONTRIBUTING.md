# Contributing

Cam on ban da muon dong gop cho `study-repository`.

## Muc tieu

Repo nay dong vai tro static data server:

- Nhanh `main`: du lieu goc
- CI/CD build sang nhanh `public`
- GitHub Pages phuc vu JSON/data da build

## Quy trinh lam viec

1. Fork repo hoac tao branch moi tu `main`.
2. Dat ten branch ro nghia, vi du: `feat/add-it-course-docs`.
3. Sua du lieu theo dung format trong `data/_ExamMajor/Example`.
4. Chay:
   - `npm run lint`
   - `npm run build`
   - hoac `npm run check`
5. Commit va tao Pull Request vao `main`.

## Cau truc du lieu bat buoc

Moi mon hoc:

```text
data/<Faculty>/<Course>/
  info.json
  thumbnail.jpg|jpeg|png|webp
  [docs]/
  [exams]/
  [qa]/
```

### 1) Course root

- Bat buoc co `info.json` tai goc mon.
- Bat buoc co 1 file thumbnail dat ten `thumbnail.*`.

`info.json` goi y:

```json
{
  "courseName": "Ky thuat lap trinh",
  "courseCode": "ITEC1504",
  "courseCredit": "3",
  "courseType": "MAJOR",
  "courseDescription": "Mo ta mon hoc"
}
```

Gia tri `courseType` hop le: `GENERAL`, `MAJOR`, `ELECTIVE`.

### 2) Docs va Exams

Moi item trong `[docs]` hoac `[exams]` la 1 thu muc rieng:

```text
[docs]/<slug>/
  info.json
  content.md | content.pdf
  ...attachments
```

Quy tac:

- Bat buoc `info.json`.
- Bat buoc dung 1 file noi dung duy nhat: `content.md` hoac `content.pdf`.
- Khong duoc co 2 file content cung luc.
- Cac file khac duoc xem la attachments.

### 3) QA

Ho tro 2 cach:

- Kieu JSON truc tiep: `[qa]/c1.json`
- Kieu item folder:

```text
[qa]/<slug>/
  info.json
  content.md | content.pdf
  ...attachments
```

Neu dung kieu JSON, nen co cac truong:

- `title`, `author`, `description`, `keywords`, `category`, `difficulty`, `data[]`

## Kiem tra truoc khi mo PR

Bat buoc:

- `npm run check` pass (khong co error)
- PR description danh dau day du cac checkbox bat buoc trong template

Cho phep warning trong mot so truong hop (vi du folder placeholder), nhung nen xu ly warning truoc khi merge neu co the.

## CI/CD hien tai

- PR check (`.github/workflows/pr-check.yml`):
  - Validate PR template
  - Chay lint
  - Chay build
  - Verify output artifacts
- Deploy (`.github/workflows/deploy.yml`):
  - Trigger khi push `main`
  - Chay `npm run check`
  - Deploy `.dist` sang nhanh `public`

## Luu y quan trong

- Khong dua du lieu thu nghiem vao cac khoa/mon that.
- Dung `data/_ExamMajor/Example` de sao chep mau.
- Neu doi schema, phai cap nhat dong bo:
  - `src/lint.ts`
  - `src/build.ts`
  - `README.md`
  - `CONTRIBUTING.md`
