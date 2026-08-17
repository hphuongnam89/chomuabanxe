INSERT INTO categories (category_id,parent_category_id,name,slug,is_leaf,sort_order,is_active) VALUES
  (1,NULL,'Điện tử','dien-tu',FALSE,1,TRUE),
  (2,1,'Điện thoại','dien-thoai',TRUE,1,TRUE),
  (3,1,'Laptop','laptop',TRUE,2,TRUE),
  (4,NULL,'Nội thất','noi-that',FALSE,2,TRUE),
  (5,4,'Ghế','ghe',TRUE,1,TRUE),
  (6,NULL,'Thời trang','thoi-trang',FALSE,3,TRUE),
  (7,6,'Quần áo','quan-ao',TRUE,1,TRUE);

INSERT INTO locations (location_id,parent_location_id,level,name,code,is_active) VALUES
  (1,NULL,1,'Hồ Chí Minh','HCM',TRUE),
  (2,1,2,'Quận 1','HCM-Q1',TRUE),
  (3,1,2,'Thành phố Thủ Đức','HCM-TD',TRUE),
  (4,NULL,1,'Hà Nội','HN',TRUE),
  (5,4,2,'Quận Cầu Giấy','HN-CG',TRUE);
