const fs = require('fs');
const files = [
  'components/admin/badges/BadgeForm.tsx',
  'components/admin/checkin-codes/CheckinCodeForm.tsx',
  'components/admin/photo-spots/PhotoSpotForm.tsx',
  'components/admin/restaurants/RestaurantForm.tsx',
  'components/admin/routes/RouteForm.tsx',
  'components/admin/routes/RouteStopsManager.tsx',
  'components/admin/stories/StoryForm.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('useEffect') && !content.includes('import { useEffect')) {
      if (content.includes('import { useActionState } from "react";')) {
          content = content.replace('import { useActionState } from "react";', 'import { useActionState, useEffect } from "react";');
      } else {
          content = 'import { useEffect } from "react";\n' + content;
      }
  }
  fs.writeFileSync(f, content);
});
console.log('Fixed imports');
