ALTER TABLE media_assets
    ADD COLUMN storage_data LONGBLOB NULL AFTER byte_size;
