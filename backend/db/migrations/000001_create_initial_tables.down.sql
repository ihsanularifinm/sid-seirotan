-- Drop indexes first
DROP INDEX IF EXISTS idx_page_views_url_viewed;
DROP INDEX IF EXISTS idx_page_views_visitor_id;
DROP INDEX IF EXISTS idx_page_views_page_url;
DROP INDEX IF EXISTS idx_page_views_viewed_at;

-- Drop tables
DROP TABLE IF EXISTS page_views;
DROP TABLE IF EXISTS hero_sliders;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS village_officials;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS potentials;
DROP TABLE IF EXISTS site_settings;
DROP TABLE IF EXISTS contacts;

-- Drop ENUM types
DROP TYPE IF EXISTS media_type;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS news_status;
DROP TYPE IF EXISTS potential_type;