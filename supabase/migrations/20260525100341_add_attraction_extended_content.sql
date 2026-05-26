-- Add extended content fields for the Attraction Visual Editor
ALTER TABLE attractions
ADD COLUMN travel_tips_th text,
ADD COLUMN travel_tips_en text,
ADD COLUMN how_to_get_there_th text,
ADD COLUMN how_to_get_there_en text,
ADD COLUMN custom_sections_json jsonb;

COMMENT ON COLUMN attractions.travel_tips_th IS 'ข้อแนะนำการเดินทางภาษาไทย';
COMMENT ON COLUMN attractions.how_to_get_there_th IS 'วิธีการเดินทางภาษาไทย';
COMMENT ON COLUMN attractions.custom_sections_json IS 'Store dynamic custom cards like Things to Do or Where to Stay directly if normalized tables are not used.';
