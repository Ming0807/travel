export const RESTAURANT_FOOD_TYPE_OPTIONS = [
  { value: "Thai", label: "อาหารไทย" },
  { value: "Malay", label: "อาหารมลายู" },
  { value: "Thai-Chinese", label: "อาหารไทย-จีน" },
  { value: "Halal", label: "อาหารฮาลาล" },
  { value: "Street Food", label: "สตรีทฟู้ด" },
  { value: "Dimsum", label: "ติ่มซำ" },
  { value: "Dessert/Cafe", label: "ของหวานและคาเฟ่" },
  { value: "Coffee", label: "คาเฟ่และกาแฟ" },
  { value: "Bakery", label: "เบเกอรี่" },
  { value: "International", label: "อาหารนานาชาติ" },
] as const;

export const ACCOMMODATION_TYPE_OPTIONS = [
  { value: "Hotel", label: "โรงแรม" },
  { value: "Resort", label: "รีสอร์ต" },
  { value: "Homestay", label: "โฮมสเตย์" },
  { value: "Guesthouse", label: "เกสต์เฮาส์" },
  { value: "Hostel", label: "โฮสเทล" },
] as const;

function controlledLabel(value: string, options: ReadonlyArray<{ value: string; label: string }>) {
  return options.find((option) => option.value.toLocaleLowerCase() === value.trim().toLocaleLowerCase())?.label ?? value;
}

export function restaurantFoodTypeLabel(value: string) {
  return controlledLabel(value, RESTAURANT_FOOD_TYPE_OPTIONS);
}

export function accommodationTypeLabel(value: string) {
  return controlledLabel(value, ACCOMMODATION_TYPE_OPTIONS);
}
