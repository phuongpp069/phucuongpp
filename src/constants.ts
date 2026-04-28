import { SpaceType, SurfaceType, MaterialType } from './types';

export const SPACE_OPTIONS: { value: SpaceType; label: string }[] = [
  { value: 'living_room', label: 'Phòng khách' },
  { value: 'bedroom', label: 'Phòng ngủ' },
  { value: 'kitchen', label: 'Bếp' },
  { value: 'bathroom', label: 'Nhà vệ sinh (WC)' },
  { value: 'garden', label: 'Sân vườn' },
  { value: 'hallway', label: 'Hành lang' },
  { value: 'balcony', label: 'Ban công' },
  { value: 'stairs', label: 'Cầu thang' },
  { value: 'facade', label: 'Mặt tiền' },
  { value: 'terrace', label: 'Sân thượng' },
  { value: 'other', label: 'Khu vực khác' },
];

export const SURFACE_OPTIONS: { value: SurfaceType; label: string }[] = [
  { value: 'floor', label: 'Sàn' },
  { value: 'wall', label: 'Tường' },
  { value: 'ceiling', label: 'Trần' },
  { value: 'skirting', label: 'Chân tường' },
  { value: 'stair_step', label: 'Bậc cầu thang' },
  { value: 'decorative_panel', label: 'Mảng trang trí' },
  { value: 'outdoor_area', label: 'Khu vực ngoài trời' },
  { value: 'sanitary_fixture', label: 'Vị trí đặt thiết bị' },
];

export const MATERIAL_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: 'floor_tile', label: 'Gạch lát sàn' },
  { value: 'wall_tile', label: 'Gạch ốp tường' },
  { value: 'stone', label: 'Đá ốp' },
  { value: 'facade_stone', label: 'Đá ốp mặt tiền' },
  { value: 'lavabo', label: 'Lavabo' },
  { value: 'toilet', label: 'Bồn cầu' },
  { value: 'shower', label: 'Vòi sen' },
  { value: 'mirror', label: 'Gương' },
  { value: 'cabinet', label: 'Tủ lavabo' },
  { value: 'other', label: 'Vật liệu trang trí khác' },
];

export const PRESET_PROMPTS = [
  { id: 'wc_basic', name: 'WC hoàn thiện cơ bản', space: 'bathroom' },
  { id: 'wc_luxury', name: 'WC cao cấp', space: 'bathroom' },
  { id: 'living_glossy', name: 'Phòng khách lát gạch bóng', space: 'living_room' },
  { id: 'living_matte', name: 'Phòng khách lát gạch mờ', space: 'living_room' },
  { id: 'bedroom_warm', name: 'Phòng ngủ ấm áp', space: 'bedroom' },
  { id: 'kitchen_modern', name: 'Bếp sạch hiện đại', space: 'kitchen' },
  { id: 'garden_anti_slip', name: 'Sân vườn chống trượt', space: 'garden' },
  { id: 'balcony_outdoor', name: 'Ban công ngoài trời', space: 'balcony' },
  { id: 'stairs_stone', name: 'Cầu thang ốp đá', space: 'stairs' },
  { id: 'facade_decorative', name: 'Mặt tiền ốp đá trang trí', space: 'facade' },
];
