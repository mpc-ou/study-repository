# Mảng Hai Chiều (Two-Dimensional Array)

## 1. Giới thiệu

Trong lập trình, **mảng (Array)** là cấu trúc dữ liệu cho phép lưu nhiều giá trị cùng kiểu trong một biến.

Ở bài trước chúng ta đã học **mảng một chiều**, ví dụ:

```
[5, 8, 2, 7, 9]
```

Tuy nhiên trong thực tế, nhiều dữ liệu có dạng **bảng (table)** như:

| ID | Name | Score |
| -- | ---- | ----- |
| 1  | An   | 8     |
| 2  | Bình | 9     |
| 3  | Chi  | 7     |

Để lưu dữ liệu dạng này, ta sử dụng **mảng hai chiều**.

Mảng hai chiều có thể hiểu đơn giản là **một bảng gồm nhiều hàng và nhiều cột**.

---

# 2. Hình dung mảng hai chiều

Ví dụ một bảng số:

```
1 2 3
4 5 6
7 8 9
```

Ta có:

* 3 **hàng**
* 3 **cột**

Có thể biểu diễn như sau:

```
      c0 c1 c2
r0 -> 1  2  3
r1 -> 4  5  6
r2 -> 7  8  9
```

Mỗi phần tử được xác định bởi:

```
[hàng][cột]
```

Ví dụ:

```
a[0][0] = 1
a[1][2] = 6
a[2][1] = 8
```

---

# 3. Khai báo mảng hai chiều

## Cú pháp

```cpp
<kieu_du_lieu> <ten_mang>[so_hang][so_cot];
```

Ví dụ:

```cpp
int a[3][4];
```

Ý nghĩa:

* `a` là tên mảng
* `3` là số hàng
* `4` là số cột

Tổng số phần tử:

```
3 × 4 = 12 phần tử
```

---

# 4. Cách lưu trữ trong bộ nhớ

Mặc dù mảng có dạng **2 chiều**, nhưng trong bộ nhớ máy tính nó được lưu **liên tiếp** theo **hàng**.

Ví dụ:

```
1 2 3
4 5 6
```

Trong bộ nhớ sẽ lưu:

```
1 2 3 4 5 6
```

Sơ đồ:

```
a[0][0] -> 1
a[0][1] -> 2
a[0][2] -> 3
a[1][0] -> 4
a[1][1] -> 5
a[1][2] -> 6
```

---

# 5. Khởi tạo mảng hai chiều

## Ví dụ

```cpp
int a[3][3] =
{
    {1,2,3},
    {4,5,6},
    {7,8,9}
};
```

Ma trận:

```
1 2 3
4 5 6
7 8 9
```

---

# 6. Nhập dữ liệu mảng

Để nhập dữ liệu cho mảng hai chiều, ta dùng **2 vòng lặp lồng nhau**.

```cpp
for(int i = 0; i < M; i++)
{
    for(int j = 0; j < N; j++)
    {
        cin >> a[i][j];
    }
}
```

### Giải thích

| Biến | Ý nghĩa    |
| ---- | ---------- |
| i    | duyệt hàng |
| j    | duyệt cột  |

Trình tự nhập:

```
a[0][0]
a[0][1]
a[0][2]
...
```

---

# 7. Xuất mảng ra màn hình

```cpp
for(int i = 0; i < M; i++)
{
    for(int j = 0; j < N; j++)
    {
        cout << a[i][j] << " ";
    }

    cout << endl;
}
```

Kết quả:

```
1 2 3
4 5 6
7 8 9
```

---

# 8. Ví dụ chương trình hoàn chỉnh

```cpp
#include <iostream>
using namespace std;

int main()
{
    int M, N;
    int a[100][100];

    cout << "Nhap so hang: ";
    cin >> M;

    cout << "Nhap so cot: ";
    cin >> N;

    // Nhập mảng
    for(int i = 0; i < M; i++)
    {
        for(int j = 0; j < N; j++)
        {
            cout << "a[" << i << "][" << j << "] = ";
            cin >> a[i][j];
        }
    }

    cout << "\nMang vua nhap:\n";

    // Xuất mảng
    for(int i = 0; i < M; i++)
    {
        for(int j = 0; j < N; j++)
        {
            cout << a[i][j] << "\t";
        }
        cout << endl;
    }

    return 0;
}
```

---

# 9. Một số thao tác thường gặp

## 9.1 Tính tổng các phần tử

```cpp
int sum = 0;

for(int i = 0; i < M; i++)
{
    for(int j = 0; j < N; j++)
    {
        sum += a[i][j];
    }
}
```

---

## 9.2 Tìm phần tử lớn nhất

```cpp
int max = a[0][0];

for(int i = 0; i < M; i++)
{
    for(int j = 0; j < N; j++)
    {
        if(a[i][j] > max)
            max = a[i][j];
    }
}
```

---

## 9.3 Tính tổng từng hàng

```cpp
for(int i = 0; i < M; i++)
{
    int sum = 0;

    for(int j = 0; j < N; j++)
    {
        sum += a[i][j];
    }

    cout << "Tong hang " << i << " = " << sum << endl;
}
```

---

# 10. Ứng dụng của mảng hai chiều

Mảng hai chiều xuất hiện rất nhiều trong lập trình.

## 1️⃣ Ma trận toán học

```
|1 2|
|3 4|
```

## 2️⃣ Bảng điểm sinh viên

```
Sinh viên × môn học
```

## 3️⃣ Bản đồ game

```
0 = đất
1 = tường
```

## 4️⃣ Xử lý ảnh

Ảnh bitmap thực chất là **ma trận pixel**.

```
pixel[row][column]
```

## 5️⃣ Bàn cờ

Ví dụ bàn cờ vua:

```
8 × 8
```

---

# 11. Bài tập luyện tập

### Bài 1

Nhập ma trận `M × N` và:

* In ma trận ra màn hình

---

### Bài 2

Tính **tổng tất cả phần tử trong mảng**

---

### Bài 3

Tìm **giá trị lớn nhất trong mảng**

---

### Bài 4

Tính **tổng từng cột**

---

### Bài 5 (khó hơn)

In **đường chéo chính của ma trận vuông**

Ví dụ:

```
1 2 3
4 5 6
7 8 9
```

Kết quả:

```
1 5 9
```

---

# 12. Tổng kết

| Kiến thức  | Nội dung                  |
| ---------- | ------------------------- |
| Cấu trúc   | Mảng nhiều hàng nhiều cột |
| Truy cập   | `a[i][j]`                 |
| Khai báo   | `int a[m][n]`             |
| Duyệt mảng | 2 vòng lặp lồng nhau      |

Mảng hai chiều là **cấu trúc dữ liệu rất quan trọng**, được dùng trong:

* xử lý dữ liệu bảng
* thuật toán ma trận
* game
* xử lý ảnh

