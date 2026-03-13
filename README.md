# 📚 study-repository

Kho dữ liệu học tập hoạt động theo mô hình **static data server**.

* Nhánh `main` dùng để **lưu trữ dữ liệu gốc**.
* CI/CD sẽ **build dữ liệu và deploy sang nhánh `public`** để phục vụ **GitHub Pages**.

---

# 📂 Cấu trúc dữ liệu

```
data/
  <Faculty>/
    <Course>/
      info.json
      thumbnail.jpg | png | webp | jpeg

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
        # hoặc
        <qa-slug>/
          info.json
          content.md | content.pdf
          ...attachments
```

⚠️ **Lưu ý:**
Các thư mục bắt đầu bằng `_` (ví dụ `data/_example`) **sẽ bị bỏ qua khi build**.

---

# 📜 Quy tắc bắt buộc

## 1. Cấu trúc môn học

Mỗi môn học bắt buộc phải có:

* `info.json` tại **thư mục gốc của môn**
* 1 ảnh **thumbnail** tại gốc môn:

```
thumbnail.jpg
thumbnail.png
thumbnail.webp
thumbnail.jpeg
```

---

## 2. Tài liệu (`docs`) và đề thi (`exams`)

Hai thư mục này chứa **các thư mục con**, mỗi item phải có:

* `info.json`
* **1 file nội dung duy nhất**:

  * `content.md` hoặc
  * `content.pdf`

Ngoài ra có thể thêm:

* hình ảnh
* file đính kèm
* dữ liệu bổ sung

Ví dụ:

```
docs/
  lecture-1/
    info.json
    content.md
    slides.pdf
```

---

## 3. Hỏi đáp / Trắc nghiệm (`qa`)

Hỗ trợ **2 dạng dữ liệu**.

### Dạng 1 — JSON trực tiếp

Dùng cho **bộ câu hỏi trắc nghiệm**.

```
qa/
  c1.json
  c2.json
```

---

### Dạng 2 — Thư mục item

Cấu trúc giống `docs` và `exams`.

```
qa/
  bai-tap-1/
    info.json
    content.md
```

---

# ⚙️ Build Output

Chạy:

```
npm run build
```

Sẽ sinh thư mục:

```
.dist/
```

Bao gồm:

| File                    | Mô tả                                     |
| ----------------------- | ----------------------------------------- |
| `main.json`             | Danh sách toàn bộ môn học                 |
| `courses/<Course>.json` | Metadata chi tiết của từng môn            |
| `stats.json`            | Thống kê tổng hợp dữ liệu                 |
| `search-index.json`     | Catalog phục vụ tìm kiếm                  |
| `search/`               | Index tìm kiếm full-text đã build         |
| `last_update.json`      | Timestamp + epoch để cache invalidation   |
| `data/`                 | Bản copy dữ liệu gốc (bỏ qua thư mục `_`) |

---

# 🧰 Scripts

| Script          | Mô tả                                  |
| --------------- | -------------------------------------- |
| `npm run lint`  | Kiểm tra và validate format dữ liệu    |
| `npm run build` | Build dữ liệu ra `.dist`               |
| `npm run check` | Chạy `lint` + `build` (dùng cho CI/CD) |
| `npm run dev`   | Alias của build để chạy local          |

---

# 🔄 CI/CD

## PR Check

File workflow:

```
.github/workflows/pr-check.yml
```

Khi mở Pull Request sẽ:

1. Validate **PR template checkbox**
2. Chạy

```
npm run lint
```

3. Chạy

```
npm run build
```

4. Kiểm tra các file output bắt buộc:

* `main.json`
* `courses/`
* `data/`
* `stats.json`
* `search-index.json`
* `last_update.json`

---

## Deploy

File workflow:

```
.github/workflows/deploy.yml
```

Trigger khi:

```
push -> main
```

Pipeline:

1. Chạy

```
npm run check
```

2. Deploy nội dung `.dist` sang **nhánh `public`**

Nhánh `public` được dùng để **serve GitHub Pages**.

---

# 🧪 Dữ liệu mẫu

Khi tạo môn học mới, có thể tham khảo cấu trúc mẫu tại:

```
data/_ExamMajor/Example
```

---

# 🤝 Đóng góp

Hướng dẫn đóng góp chi tiết nằm tại:


CONTRIBUTING.md
```
