INSERT INTO locations (location_id,parent_location_id,level,name,code,is_active)
VALUES (1000,NULL,1,'Việt Nam','VN',TRUE)
ON DUPLICATE KEY UPDATE
    parent_location_id = VALUES(parent_location_id),
    level = VALUES(level),
    name = VALUES(name),
    code = VALUES(code),
    is_active = VALUES(is_active);

UPDATE locations
SET parent_location_id = 1000, level = 2, name = 'Hồ Chí Minh', code = 'VN-HCM', is_active = TRUE
WHERE location_id = 1;

UPDATE locations
SET parent_location_id = 1000, level = 2, name = 'Hà Nội', code = 'VN-HN', is_active = TRUE
WHERE location_id = 4;

UPDATE listings SET location_id = 1 WHERE location_id IN (2,3);
UPDATE listings SET location_id = 4 WHERE location_id = 5;

UPDATE locations SET is_active = FALSE WHERE location_id IN (2,3,5);

INSERT INTO locations (location_id,parent_location_id,level,name,code,is_active) VALUES
  (1001,1000,2,'An Giang','VN-AG',TRUE),
  (1002,1000,2,'Bắc Ninh','VN-BN',TRUE),
  (1003,1000,2,'Cà Mau','VN-CM',TRUE),
  (1004,1000,2,'Cao Bằng','VN-CB',TRUE),
  (1005,1000,2,'Cần Thơ','VN-CT',TRUE),
  (1006,1000,2,'Đà Nẵng','VN-DN',TRUE),
  (1007,1000,2,'Đắk Lắk','VN-DL',TRUE),
  (1008,1000,2,'Điện Biên','VN-DB',TRUE),
  (1009,1000,2,'Đồng Nai','VN-DNI',TRUE),
  (1010,1000,2,'Đồng Tháp','VN-DT',TRUE),
  (1011,1000,2,'Gia Lai','VN-GL',TRUE),
  (1012,1000,2,'Hà Tĩnh','VN-HT',TRUE),
  (1013,1000,2,'Hải Phòng','VN-HP',TRUE),
  (1014,1000,2,'Huế','VN-HUE',TRUE),
  (1015,1000,2,'Hưng Yên','VN-HY',TRUE),
  (1016,1000,2,'Khánh Hòa','VN-KH',TRUE),
  (1017,1000,2,'Lai Châu','VN-LC',TRUE),
  (1018,1000,2,'Lâm Đồng','VN-LD',TRUE),
  (1019,1000,2,'Lạng Sơn','VN-LS',TRUE),
  (1020,1000,2,'Lào Cai','VN-LCA',TRUE),
  (1021,1000,2,'Nghệ An','VN-NA',TRUE),
  (1022,1000,2,'Ninh Bình','VN-NB',TRUE),
  (1023,1000,2,'Phú Thọ','VN-PT',TRUE),
  (1024,1000,2,'Quảng Ngãi','VN-QN',TRUE),
  (1025,1000,2,'Quảng Ninh','VN-QNI',TRUE),
  (1026,1000,2,'Quảng Trị','VN-QT',TRUE),
  (1027,1000,2,'Sơn La','VN-SL',TRUE),
  (1028,1000,2,'Tây Ninh','VN-TN',TRUE),
  (1029,1000,2,'Thái Nguyên','VN-TNG',TRUE),
  (1030,1000,2,'Thanh Hóa','VN-TH',TRUE),
  (1031,1000,2,'Tuyên Quang','VN-TQ',TRUE),
  (1032,1000,2,'Vĩnh Long','VN-VL',TRUE)
ON DUPLICATE KEY UPDATE
    parent_location_id = VALUES(parent_location_id),
    level = VALUES(level),
    name = VALUES(name),
    code = VALUES(code),
    is_active = VALUES(is_active);
