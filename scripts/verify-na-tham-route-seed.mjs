// Optional local-only PostgreSQL/WASM QA. Never reads .env or a remote database.
// npm install --prefix .tmp-tests/route-seed-runtime --no-save --package-lock=false --ignore-scripts @electric-sql/pglite
// node scripts/verify-na-tham-route-seed.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const requireRuntime = createRequire(new URL('../.tmp-tests/route-seed-runtime/package.json', import.meta.url));
const { PGlite } = requireRuntime('@electric-sql/pglite');
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const initial = await read('supabase/migrations/20260520000000_init_schema.sql');
const slugMigration = await read('supabase/migrations/20260528002000_add_suggested_route_slugs.sql');
const seed = await read('supabase/seed/na_tham_curated_routes.sql');
const preflight = await read('supabase/seed/na_tham_routes_preflight.sql');
const specs = JSON.parse(seed.split('$json$')[1]);
const db = await PGlite.create();
let checks = 0;

try {
  // Use the repository's actual table definitions, not permissive mock columns.
  for (const table of ['provinces', 'districts', 'attraction_types', 'attractions', 'suggested_routes', 'suggested_route_stops']) {
    const definition = initial.match(new RegExp(`CREATE TABLE public\\.${table} \\([\\s\\S]*?\\r?\\n\\);`));
    assert.ok(definition, `Missing schema definition: ${table}`);
    await db.exec(definition[0]);
  }
  await db.exec(slugMigration);
  await db.exec('ALTER TABLE public.suggested_routes DROP COLUMN cover_image_path; CREATE UNIQUE INDEX uq_suggested_routes_name_en ON public.suggested_routes(name_en);');
  await db.exec("INSERT INTO public.provinces (province_name_th, province_name_en) VALUES ('ยะลา','Yala'), ('ปัตตานี','Pattani');");
  const pilot = ['your-father','sleeping-buddha-cave','kampan','golden-junk-cave','nang-monto-cave','srivijaya','dark-cave','simiya-community','tigercave','artcave','wat-khuha-phimuk'];
  for (const slug of pilot) {
    await db.query('INSERT INTO public.attractions (province_id,slug,name_th,is_active,is_published) VALUES (1,$1,$1,true,true)', [slug]);
  }
  assert.equal(specs.length, 3);
  assert.ok(specs.every((route) => route.stops.length >= 2 && route.stops.every((stop) => pilot.includes(stop.slug))));

  await db.exec(seed);
  const first = await db.query('SELECT slug, is_published FROM public.suggested_routes ORDER BY slug');
  assert.equal(first.rows.length, 3);
  assert.ok(first.rows.every((row) => row.is_published === false));
  assert.equal((await db.query('SELECT count(*)::int AS n FROM public.suggested_route_stops')).rows[0].n, 10);
  checks++;

  const snapshot = async () => (await db.query('SELECT row_to_json(t) AS data FROM (SELECT * FROM public.suggested_routes ORDER BY route_id) t')).rows;
  const original = await snapshot();
  await db.exec(seed);
  assert.deepEqual(await snapshot(), original);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM public.suggested_route_stops')).rows[0].n, 10);
  checks++;

  await db.exec("UPDATE public.suggested_routes SET name_th = 'CMS edited', is_published = true WHERE slug = 'na-tham-temple-heritage'; DELETE FROM public.suggested_route_stops WHERE route_id = (SELECT route_id FROM public.suggested_routes WHERE slug = 'na-tham-temple-heritage') AND display_order = 4;");
  const edited = await snapshot();
  await db.exec(seed);
  assert.deepEqual(await snapshot(), edited);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM public.suggested_route_stops')).rows[0].n, 9);
  checks++;

  for (const mutation of [
    "UPDATE public.attractions SET is_published = false WHERE slug = 'kampan'",
    "UPDATE public.attractions SET is_active = false WHERE slug = 'kampan'",
    "UPDATE public.attractions SET province_id = 2 WHERE slug = 'kampan'",
    "UPDATE public.attractions SET slug = 'missing-kampan' WHERE slug = 'kampan'",
  ]) {
    await db.exec('DELETE FROM public.suggested_route_stops; DELETE FROM public.suggested_routes;');
    await db.exec(mutation);
    await assert.rejects(db.exec(seed), /NA_THAM_ROUTE_SEED/);
    await db.exec('ROLLBACK;');
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.suggested_routes')).rows[0].n, 0);
    await db.exec("UPDATE public.attractions SET is_published=true,is_active=true,province_id=1,slug='kampan' WHERE slug IN ('kampan','missing-kampan');");
    checks++;
  }

  await db.query('INSERT INTO public.suggested_routes (slug,name_th,name_en) VALUES ($1,$2,$3)', ['existing-other-route', 'Existing content', specs[1].nameEn]);
  await assert.rejects(db.exec(seed), /duplicate key/);
  await db.exec('ROLLBACK;');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM public.suggested_routes')).rows[0].n, 1);
  checks++;

  const report = await db.exec(preflight);
  assert.equal(report[0].rows.length, 11);
  assert.equal(report[0].rows.filter((row) => row.reference_site_map).length, 2);
  assert.ok(report[0].rows.every((row) => row.review_status === 'MISSING_COORDINATES'));
  checks++;

  await db.exec("UPDATE public.attractions SET latitude=6.522165,longitude=101.233363 WHERE slug='artcave';");
  const mapped = (await db.exec(preflight))[0].rows.find((row) => row.slug === 'artcave');
  assert.equal(mapped.review_status, 'NUMERIC_COORDINATES_PRESENT_VERIFY_ENTRANCE');
  assert.ok(mapped.stored_coordinate_map.startsWith('https://www.google.com/maps/search/?api=1&query='));
  checks++;
  console.log(`${checks} Na Tham route seed checks passed in isolated PostgreSQL/WASM. No production connection.`);
} finally {
  await db.close();
}
