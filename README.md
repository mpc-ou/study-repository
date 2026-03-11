# 📚 Study Repository

Kho lưu trữ tài liệu học tập trong phạm vi kiến thức của Trường Đại học Mở TP.HCM.

Repository này hoạt động như một **static API server** thông qua GitHub Pages. Dữ liệu được quản lý trên nhánh `main` và tự động build sang nhánh `public` qua CI/CD.

---

## 📁 Cấu trúc dự án

```
study-repository/
├── data/                         # Dữ liệu chính
│   ├── _ExamMajor/               # Thư mục mẫu (bỏ qua khi build)
│   │   └── Example/
│   └── {Khoa}/                   # Tên khoa (VD: IT)
│       └── {MonHoc}/             # Tên môn học (VD: ProgrammingTechniques)
│           ├── info/
│           │   ├── info.json     # Thông tin môn học
│           │   └── thumbnail.jpg # Ảnh đại diện (.jpg/.png/.webp)
│           ├── docs/             # Bài đăng lý thuyết
│           │   ├── *.md
│           │   └── images/
│           ├── exams/            # Đề thi
│           │   ├── *.md
│           │   └── images/
│           └── qa/               # Trắc nghiệm
│               └── *.json
├── src/                          # Source code build system
├── .github/                      # GitHub Actions CI/CD
├── package.json
└── tsconfig.json
```

### Nhánh `public` (sau khi build)

```
public/
├── main.json                     # Index tất cả môn học
├── courses/
│   └── {MonHoc}.json             # Chi tiết từng môn (docs, exams, qa)
└── data/                         # Dữ liệu gốc (đã xử lý)
    └── {Khoa}/{MonHoc}/...
```

---

## 🚀 Bắt đầu

### Yêu cầu

- [Node.js](https://nodejs.org/) >= 18
- npm >= 9

### Cài đặt

```bash
git clone https://github.com/<username>/study-repository.git
cd study-repository
npm install
```

### Các lệnh

| Lệnh | Mô tả |
| --- | --- |
| `npm run lint` | Kiểm tra format và cấu trúc dữ liệu |
| `npm run build` | Build ra thư mục `.dist/` (thử nghiệm local) |
| `npm run dev` | Giống `build` - dùng để phát triển local |

---

## 📝 Hướng dẫn đóng góp

### 1. Thêm môn học mới

Tham khảo mẫu tại `data/_ExamMajor/Example/`.

**Bước 1:** Tạo thư mục môn học:

```
data/{Khoa}/{TenMonHoc}/
├── info/
│   ├── info.json
│   └── thumbnail.jpg
├── docs/
│   └── images/
├── exams/
│   └── images/
└── qa/
```

**Bước 2:** Tạo `info/info.json`:

```json
{
    "courseName": "Kỹ thuật lập trình",
    "courseCode": "ITEC1504",
    "courseCredit": "3",
    "courseType": "MAJOR",
    "courseDescription": "Mô tả về môn học"
}
```

> `courseType` gồm: `GENERAL` (đại cương), `MAJOR` (chuyên ngành), `ELECTIVE` (tự chọn)

**Bước 3:** Thêm ảnh đại diện `info/thumbnail.jpg` (hoặc `.png`, `.webp`)

### 2. Thêm tài liệu lý thuyết (docs)

Tạo file markdown trong `docs/`. Đầu mỗi file **bắt buộc** có phần INFO:

```markdown
<!-- INFO -->
- title: "Chương 1: Giới thiệu về môn học"
- author: "Tên tác giả"
- date: "2025-01-01"
- summary: "Tóm tắt nội dung chính của chương này"
- keywords: ["từ khóa 1", "từ khóa 2", "từ khóa 3"]
- thumbnail: "./images/thumbnail-c1.jpg"

<!-- CONTENT -->
# Nội dung bắt đầu ở đây...
```

> `thumbnail` là tùy chọn, các trường khác bắt buộc.

Hình ảnh đặt trong thư mục `docs/images/`.

### 3. Thêm đề thi (exams)

Tương tự docs, tạo file markdown trong `exams/` với phần INFO:

```markdown
<!-- INFO -->
- title: "Đề Thi Kỹ Thuật Lập Trình 2025 - Cuối Kì"
- author: "Tên tác giả"
- date: "2025-06-15"
- summary: "Đề thi cuối kì môn KTLT"
- keywords: ["đề thi", "cuối kì", "KTLT"]

<!-- CONTENT -->
# Nội dung đề thi...
```

Hình ảnh đặt trong thư mục `exams/images/`.

### 4. Thêm câu hỏi trắc nghiệm (qa)

Tạo file JSON trong `qa/`:

```json
{
    "title": "Biến trong C++",
    "author": "John Doe",
    "description": "Mô tả bộ câu hỏi",
    "keywords": ["C++", "biến"],
    "category": "Programming",
    "difficulty": "Easy",
    "data": [
        {
            "question": "Biến trong C++ là gì?",
            "options": [
                "Đáp án A",
                "Đáp án B",
                "Đáp án C",
                "Đáp án D"
            ],
            "answer": 0,
            "explanation": "Giải thích đáp án đúng"
        }
    ]
}
```

| Trường | Bắt buộc | Mô tả |
| --- | --- | --- |
| `title` | ✅ | Tên bộ câu hỏi |
| `author` | ✅ | Tác giả |
| `description` | ✅ | Mô tả |
| `keywords` | ✅ | Từ khóa |
| `category` | ✅ | Danh mục |
| `difficulty` | ✅ | Độ khó |
| `data` | ✅ | Mảng câu hỏi |
| `data[].question` | ✅ | Nội dung câu hỏi |
| `data[].options` | ✅ | Mảng đáp án |
| `data[].answer` | ✅ | Index đáp án đúng (bắt đầu từ 0) |
| `data[].explanation` | ❌ | Giải thích |

---

## 🔄 Quy trình Pull Request

### Bước 1: Fork và tạo nhánh

```bash
git checkout -b feat/ten-mon-hoc
```

### Bước 2: Thêm/sửa nội dung theo hướng dẫn trên

### Bước 3: Kiểm tra

```bash
npm run lint    # Kiểm tra format
npm run build   # Thử build local
```

### Bước 4: Tạo Pull Request

- PR phải target nhánh `main`
- Điền đầy đủ PR template:
  - ✅ Check tất cả checkbox bắt buộc
  - Mô tả thay đổi
  - Liệt kê môn học liên quan

### Bước 5: Review

- CI sẽ tự động chạy lint và build
- Cần ít nhất 1 approve để merge

---

## ⚙️ CI/CD

| Workflow | Trigger | Mô tả |
| --- | --- | --- |
| **PR Check** | Pull Request → `main` | Validate checkbox, lint, test build |
| **Deploy** | Push → `main` | Build và deploy sang nhánh `public` |

### GitHub Pages

Sau khi deploy, dữ liệu có thể truy cập qua:

```
https://<username>.github.io/study-repository/main.json
https://<username>.github.io/study-repository/courses/ProgrammingTechniques.json
https://<username>.github.io/study-repository/data/IT/ProgrammingTechniques/docs/chuong-1.md
```

**Cài đặt GitHub Pages:**
1. Vào Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: `public` / `/ (root)`

---

## 📊 API Output

### `main.json` — Danh sách tất cả môn học

```json
[
    {
        "courseName": "Kỹ thuật lập trình",
        "courseCode": "ITEC1504",
        "courseCredit": "3",
        "courseType": "MAJOR",
        "courseDescription": "...",
        "thumbnail": "data/IT/ProgrammingTechniques/info/thumbnail.jpg",
        "faculty": "IT",
        "include": "courses/ProgrammingTechniques.json"
    }
]
```

### `courses/{MonHoc}.json` — Chi tiết môn học

```json
{
    "courseName": "Kỹ thuật lập trình",
    "courseCode": "ITEC1504",
    "courseCredit": "3",
    "courseType": "MAJOR",
    "courseDescription": "...",
    "thumbnail": "data/IT/ProgrammingTechniques/info/thumbnail.jpg",
    "faculty": "IT",
    "docs": [
        {
            "title": "Chương 1: Giới thiệu",
            "author": "...",
            "date": "...",
            "summary": "...",
            "keywords": ["..."],
            "thumbnail": "data/IT/ProgrammingTechniques/docs/images/thumbnail-c1.jpg",
            "file": "data/IT/ProgrammingTechniques/docs/chuong-1.md"
        }
    ],
    "exams": [
        {
            "title": "Đề thi cuối kì 2025",
            "author": "...",
            "date": "...",
            "summary": "...",
            "keywords": ["..."],
            "file": "data/IT/ProgrammingTechniques/exams/cuoi-ki-2025.md"
        }
    ],
    "qa": [
        {
            "title": "Biến trong C++",
            "author": "John Doe",
            "description": "...",
            "keywords": ["..."],
            "category": "Programming",
            "difficulty": "Easy",
            "data": ["..."],
            "file": "data/IT/ProgrammingTechniques/qa/c1.json"
        }
    ]
}
```

---

## 📜 License

Xem file [LICENSE](LICENSE).
