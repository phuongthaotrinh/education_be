# Education Management

## Technologies Used

-  Nodejs/Typescript
-  Express
-  MongoDB
-  Redis
-  Webpack/swc
-  Google APIs

## Setup and Installation

Cách setup dự án dưới local

1. Clone the repository:

```bash
git clone https://github.com/PeoScouser98/BE_education_management.git <folder_name>
```

2. Chuyển đến folder sau khi clone

```bash
cd <folder_name>
```

3. Download và copy file .env vào folder root để lấy các biến môi trường (Repository owner sẽ cung cấp cho các contributors)
4. Cài đặt các packages

```bash
$ npm install
```

5. Run project

```bash
$ npm run dev
```

6. Build project

```bash
$ npm run build
```

7. Mở trình duyệt và truy cập vào http://localhost:3001/api/document/ để check API document

## Features:

-  Quản lý học sinh (thành tích học tập, điểm danh, lịch học, ...)
-  Quản lý giáo viên (hồ sơ giáo viên, lịch giảng dạy, điểm danh học sinh,...)
-  Quản lý học liệu của nhà trường
-  Hệ thống gửi mail và SMS tự động
