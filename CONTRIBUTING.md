# 🤝 Contributing

Cảm ơn bạn đã quan tâm và muốn đóng góp cho **`study-repository`**.

Repository này hoạt động như một **static data server** phục vụ dữ liệu học tập.

---

# 🎯 Mục tiêu của repository

Repo được tổ chức theo mô hình:

* **`main`** → lưu trữ **dữ liệu gốc**
* **CI/CD** → build dữ liệu
* **`public`** → chứa dữ liệu đã build để phục vụ **GitHub Pages**

GitHub Pages sẽ cung cấp:

* JSON metadata
* dữ liệu tài liệu
* index tìm kiếm

---

# 🛠 Quy trình đóng góp

1️⃣ **Fork repo** hoặc tạo **branch mới từ `main`**

2️⃣ Đặt tên branch rõ nghĩa, ví dụ:

```
feat/add-it-course-docs
fix/update-math-exams
data/add-physics-qa
```

3️⃣ Thêm hoặc chỉnh sửa dữ liệu theo đúng format mẫu tại:

```
data/_ExamMajor/Example
```

4️⃣ Chạy kiểm tra dữ liệu:

```bash
npm run lint
npm run build
```

Hoặc chạy nhanh:

```bash
npm run check
```

5️⃣ Commit thay đổi và tạo **Pull Request vào `main`**

---

# 📂 Cấu trúc dữ liệu bắt buộc

Mỗi môn học phải có cấu trúc:

```
data/<Faculty>/<Course>/
  info.json
  thumbnail.jpg|jpeg|png|webp

  [docs]/
  [exams]/
  [qa]/
```

---

# 1️⃣ Course Root

Mỗi môn học **bắt buộc phải có**:

* `info.json`
* 1 ảnh thumbnail tên `thumbnail.*`

Ví dụ:

```
data/IT/Programming/
  info.json
  thumbnail.png
```

---

### Ví dụ `info.json`

```json
{
  "courseName": "Kỹ thuật lập trình",
  "courseCode": "ITEC1504",
  "courseCredit": "3",
  "courseType": "MAJOR",
  "courseDescription": "Mô tả môn học"
}
```

### Giá trị hợp lệ của `courseType`

| Giá trị    | Ý nghĩa          |
| ---------- | ---------------- |
| `GENERAL`  | Môn đại cương    |
| `MAJOR`    | Môn chuyên ngành |
| `ELECTIVE` | Môn tự chọn      |

---

# 2️⃣ Docs và Exams

Mỗi tài liệu hoặc đề thi là **một thư mục riêng**.

Ví dụ:

```
[docs]/<slug>/
  info.json
  content.md | content.pdf
  ...attachments
```

### Quy tắc

Bắt buộc:

* có `info.json`
* có **1 file nội dung duy nhất**

```
content.md
hoặc
content.pdf
```

Không được:

```
content.md + content.pdf
```

Các file khác sẽ được coi là **attachments**.

---

# 3️⃣ QA (Hỏi đáp / Trắc nghiệm)

Thư mục `[qa]` hỗ trợ **2 cách lưu dữ liệu**.

---

## Cách 1 — JSON trực tiếp

Dùng cho **bộ câu hỏi trắc nghiệm**.

```
[qa]/
  c1.json
  c2.json
```

Gợi ý các field nên có:

* `title`
* `author`
* `description`
* `keywords`
* `category`
* `difficulty`
* `data[]`

---

## Cách 2 — Item dạng thư mục

Cấu trúc giống `docs` và `exams`.

```
[qa]/<slug>/
  info.json
  content.md | content.pdf
  ...attachments
```

---

# ✅ Kiểm tra trước khi mở PR

Trước khi tạo Pull Request, đảm bảo:

```
npm run check
```

✔ Không có **error**

PR phải:

* điền đầy đủ **PR template**
* đánh dấu các **checkbox bắt buộc**

---

### Warning

Một số trường hợp có thể xuất hiện **warning** (ví dụ: folder placeholder).

Tuy nhiên nên cố gắng **xử lý warning trước khi merge** nếu có thể.

---

# ⚙️ CI/CD hiện tại

## PR Check

File workflow:

```
.github/workflows/pr-check.yml
```

Khi mở Pull Request, hệ thống sẽ:

1️⃣ Validate PR template
2️⃣ Chạy `npm run lint`
3️⃣ Chạy `npm run build`
4️⃣ Kiểm tra các file output:

```
main.json
courses/
data/
stats.json
search-index.json
last_update.json
```

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

Pipeline sẽ:

1️⃣ Chạy

```
npm run check
```

2️⃣ Deploy `.dist` sang nhánh:

```
public
```

Nhánh `public` dùng để **serve GitHub Pages**.

---

# ⚠️ Lưu ý quan trọng

* Không thêm **dữ liệu thử nghiệm** vào các môn thật.
* Sử dụng dữ liệu mẫu tại:

```
data/_ExamMajor/Example
```

khi tạo môn mới.

---

# 🔧 Khi thay đổi schema

Nếu thay đổi cấu trúc dữ liệu hoặc schema, cần cập nhật đồng bộ các file:

```
src/lint.ts
src/build.ts
README.md
CONTRIBUTING.md
```

Điều này giúp tránh lỗi khi build và deploy.


để repo nhìn **rất chuyên nghiệp khi public trên GitHub**.
