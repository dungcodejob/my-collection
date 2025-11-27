AC 32: Under the “Phân loại hàng” sub-section are the following elements:

Element

Control

Description

[Phân loại] Tag Group

Various

One custom Tag Group. User can customize Group name, add Tags and Delete Tag .

[Thêm phân loại] button

Button

Add a new custom Tag group.

AC 33: Each “Phân loại” Tag Group has the following elements:

Element

Control

Default Value

Description

Tag Group name

TextBox

Phân loại 1

The name of the Tag Group

[Nhập phân loại] box

TagBox; Search Mode

Search or add new tags

[Delete] button

Button

Delete the Tag Group

AC 34: When user clicks [Thêm phân loại] button, generate a new Tag Group. Clicking the [Delete] button removes the Tag Group that contains the clicked [Delete] button.

AC 35: [Delete] action shows confirmation box.

AC 36: If any Tag Group is missing [Nhập phân loại] input, save is failed and show error message: “Thông tin [Phân loại] đang bị bỏ trống!”. Else, [Phân loại hàng] sub-section is considered valid.

“Đợt nhập hàng” feature
AC 37: Under the “Đợt nhập hàng” sub-section are the following elements:

Element

Control

Min Value

Max Value

Default Value

Required

Description

Note

Ngày nhập hàng

DateBox

Current date

Yes

The date of importing inventory

Ngày sản xuất

DateBox; Unselected

Current date

No

The date of manufacturing

[Ngày sản xuất] must not exceed current date

Ngày hết hạn

DateBox; Unselected

Current date

No

The date of expiry

Additional check: cannot be lower than Manufacturing date & Import date

Giá vốn

NumberBox

Yes

Inventory price

Cannot be empty

Giá bán

NumberBox

Yes

Retail price

Cannot be empty

AC 38: If any required [Đợt nhập hàng] element is missing input, save is failed and show error message: “Thông tin [Đợt nhập hàng] đang bị bỏ trống!”. Else, [Đợt nhập hàng] sub-section is considered valid.

“Danh sách hàng hóa cùng loại” feature
AC 39: [Danh sách hàng hóa cùng loại] is a DataGrid with the following headers:

Header name

Control

Default Value

Editable?

Required?

Note

Tên

TextBox

[Tên hàng hóa] flow

No

Mã chung

TextBox

[Mã chung] flow

No

Mã chi tiết

TextBox

[Mã chi tiết] flow

No

Phân loại

TextBox

No

Custom Tag Groups are added at this position in the grid

Đơn vị

SelectBox

[Đơn vị hàng] flow + [Đơn vị quy đổi] flow

No

Ngày nhập hàng

DateBox

[Ngày nhập hàng] flow

Yes

Yes

Ngày sản xuất

DateBox

[Ngày sản xuất] flow

Yes

No

Ngày hết hạn

DateBox

[Ngày hết hạn] flow

Yes

No

Giá vốn

NumberBox + Currency

[Giá vốn] flow

Yes

Yes

Giá bán

NumberBox + Currency

[Giá bán] flow

Yes

Yes

Tồn kho

NumberBox

1

Yes

Yes

AC 40: [Cập nhật tất cả] button activates three actions on [Danh sách hàng hóa cùng loại] DataGrid: Adding new columns, Adding variants of the same products and Batch updating (AC 41-43)

AC 41: Adding new columns: [Danh sách hàng hóa cùng loại] DataGrid supports adding new headers (columns) as custom Tag Groups created by user. When clicking [Cập nhật tất cả] button, automatically add all [Phân loại] Tag Groups as new columns.

AC 42: Adding variants of the same product: When clicking [Cập nhật tất cả] button, generate rows using Cartesian product of all tags across all Tag Groups. Each combination of tags (one tag from each Tag Group) generates a new row, which is a variant of that product. Example: If Tag Group 1 has tags [A, B] and Tag Group 2 has tags [X, Y], this generates 4 rows: (A,X), (A,Y), (B,X), (B,Y).

AC 43: Batch updating: [Danh sách hàng hóa cùng loại] DataGrid supports batch updating [Ngày nhập hàng], [Ngày sản xuất], [Ngày hết hạn], [Giá vốn], [Giá bán] columns based on flows from “Đợt nhập hàng” feature. When clicking [Cập nhật tất cả] button, the following columns are automatically updated:

[Đợt nhập hàng] sub-section elements

[Danh sách hàng hóa cùng loại] columns

Note

[Ngày nhập hàng]

Ngày nhập hàng

[Ngày sản xuất]

Ngày sản xuất

[Ngày hết hạn]

Ngày hết hạn

[Giá vốn]

Giá vốn

[Giá bán]

Giá bán

AC 44: If any required [Danh sách ] element is missing input, save is failed and show error message: "Thông tin [Đợt nhập hàng] đang bị bỏ trống!". Else, [Đợt nhập hàng] sub-section is considered valid.

## Clarifications

### Session 2025-01-06

- Q: When multiple Tag Groups exist and the user clicks [Cập nhật tất cả], how should rows be generated from the tags? (AC 42) → A: Cartesian product: Generate one row for every combination of tags across all Tag Groups (e.g., 2 groups with 3 tags each = 9 rows)
