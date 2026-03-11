# TRƯỜNG ĐẠI HỌC MỞ TP.HCM  
## KHOA CÔNG NGHỆ THÔNG TIN  

# ĐỀ KIỂM TRA CUỐI KỲ

**MÔN:** KỸ THUẬT LẬP TRÌNH  
**HỌC KỲ:**  
**NĂM HỌC:**  

**LỚP:**  
**HỆ:** ĐẠI HỌC CHÍNH QUI  

**Thời gian thi:** 90 phút  

Sinh viên được sử dụng **tài liệu giấy**.

Sinh viên tạo project mang tên:

```

MSSV_HoTen

```

lưu ở ổ đĩa **D**.

Mỗi bài làm lưu với định dạng:

```

SoMay_MSSV_HoTen.cpp

```

Cuối giờ chép toàn bộ các file `.cpp` (nếu cần thì thêm `.h` và `.txt`) sang ổ đĩa **S**.

---

# Yêu cầu

Viết **01 chương trình** thực hiện các yêu cầu sau *(cấp phát bộ nhớ động cho lưu trữ nhiều đối tượng struct)*:

## a. Định nghĩa struct Sach (1 điểm)

Struct `Sach` gồm các thông tin:

- **Mã sách**: kiểu chuỗi `c-string`
- **Tên sách**: kiểu chuỗi `c-string`
- **Ngày tháng năm xuất bản**: kiểu `NTN`  
  - `NTN` là kiểu `struct` gồm:
    - ngày (int)
    - tháng (int)
    - năm (int)

---

## b. Hàm nhập thông tin cho tối đa 20 sách (1 điểm)

---

## c. Đọc dữ liệu từ file (1 điểm)

Giả sử có file **DuLieuSach.txt** có thông tin:

```

5
Sp01#Tieng Viet#1-1-2019
Sp02#Khoa Hoc Tu Nhien#2-3-2015
Sp03#Ngu Van#5-5-2019
Sp04#Tieng Anh#30-3-2019
Sp05#Bai Tap Tin Hoc#10-7-2020

```

Hãy viết **hàm đọc dữ liệu từ file** lên cho danh sách sách theo cấu trúc `struct` đã định nghĩa.

Biết rằng:

- Dòng đầu tiên lưu **số lượng sách trong file**

---

## d. Hàm xuất thông tin của các sách đang lưu trữ trong chương trình (1 điểm)

---

## e. Hàm sắp xếp các sách theo **năm xuất bản tăng dần** (1 điểm)

---

## f. Hàm đếm số sách có năm xuất bản **2019** (1 điểm)

---

## g. Hàm chuẩn hoá chuỗi (1 điểm)

Hàm nhận vào **1 chuỗi c-string**, trả về kết quả:

- Loại bỏ khoảng trắng **đầu và cuối**
- Chỉ giữ lại **1 khoảng trắng giữa các từ**
- Chuyển chuỗi về dạng:
  - **Chữ cái đầu mỗi từ viết hoa**
  - **Các ký tự còn lại viết thường**

Ví dụ:

```

"   tIeNg   vIeT  "
→ "Tieng Viet"

```

---

## h. Hàm gợi ý tên sách (1 điểm)

Hàm nhận vào **tên sách từ bàn phím** và trả ra **kết quả gợi ý** dựa trên nguyên tắc **chuẩn hoá chuỗi** ở câu trên.

Ví dụ:

Người dùng nhập:

```

Ti

```

Sau khi chuẩn hoá, chương trình gợi ý:

```

Tieng Viet
Tieng Anh

```

---

## i. Hàm main (menu chương trình)

Hàm `main` kiểm chứng chương trình dưới dạng **menu lựa chọn chức năng** và **có kiểm soát dữ liệu nhập hợp lệ**.


