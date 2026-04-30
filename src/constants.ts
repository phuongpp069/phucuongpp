import { SpaceType, SurfaceType, MaterialType, MaterialLibraryItem } from './types';

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
  { 
    id: 'wc_basic', 
    name: 'WC hoàn thiện ốp lát ngang', 
    description: 'Kích thước nhà vệ sinh: rộng 2m x dài 4m.\n- Lát sàn: Mẫu 1 (kích thước 30x60cm), lát ngang.\n- Ốp tường: Mẫu 2 (kích thước 30x60cm), ốp ngang liền mạch với ron gạch sàn.',
    space: 'bathroom' as SpaceType 
  },
  { 
    id: 'wc_staggered', 
    name: 'WC lát nền so le', 
    description: 'Kích thước nhà vệ sinh: rộng 2.5m x dài 3m.\n- Lát sàn: Mẫu 1 (kích thước 30x60cm), lát dọc so le (1 hàng bắt đầu bằng viên nguyên, hàng tiếp theo bắt đầu bằng nửa viên).\n- Ốp tường: Mẫu 2 (kích thước 60x60cm).',
    space: 'bathroom' as SpaceType 
  },
  { 
    id: 'living_large', 
    name: 'Phòng khách gạch khổ lớn', 
    description: 'Kích thước phòng: rộng 5m x dài 6m.\n- Lát sàn: Mẫu 1 (gạch bóng kiếng 80x80cm), lát thẳng nguyên viên từ cửa chính vào.\n- Chân tường: Ốp len chân tường cao 12cm cắm sâu vào tường.',
    space: 'living_room' as SpaceType 
  },
  { 
    id: 'bedroom_wood', 
    name: 'Phòng ngủ lát gỗ xương cá', 
    description: 'Kích thước phòng: rộng 4m x dài 4.5m.\n- Lát sàn: Mẫu 1 (sàn gỗ 15x90cm), lát theo họa tiết xương cá (herringbone) chạy dọc theo hướng ánh sáng cửa sổ.',
    space: 'bedroom' as SpaceType 
  },
  { 
    id: 'kitchen_modern', 
    name: 'Bếp ốp gạch thẻ', 
    description: 'Kích thước bếp: bàn bếp dài 3.5m.\n- Tường bếp (backsplash): Mẫu 1 (gạch thẻ mờ 7.5x30cm), ốp kiểu so le (subway), ron gạch màu trắng.\n- Lát sàn: Mẫu 2 (gạch terrazzo 60x60cm).',
    space: 'kitchen' as SpaceType 
  },
  { 
    id: 'balcony_outdoor', 
    name: 'Ban công gạch giả gỗ', 
    description: 'Kích thước ban công: rộng 1.5m x dài 4m.\n- Lát sàn: Mẫu 1 (gạch giả gỗ ngoài trời 15x60cm), lát so le 1/3, ron gạch màu xám đậm cách nhau 3mm.',
    space: 'balcony' as SpaceType 
  },
  { 
    id: 'stairs_stone', 
    name: 'Cầu thang ốp đá nguyên khối', 
    description: 'Bậc cầu thang dài 1m, rộng 25cm.\n- Mặt bậc cầu thang: Mẫu 1 (đá Granite tự nhiên).\n- Cổ bậc: Sơn trắng hoặc dùng gạch thẻ màu trắng để tăng độ sáng.',
    space: 'stairs' as SpaceType 
  },
];

export const ROOM_PROMPTS = [
  {
    roomName: 'Phòng vệ sinh / Phòng tắm',
    prompt: 'Phòng vệ sinh rộng 2m, dài 4m. Sử dụng Mẫu 1 (kích thước gạch 30x60cm) để lát sàn. Lát dọc, thẳng ron không xếp so le. Tất cả các viên gạch đều bắt đầu bằng nhau, để nguyên kích thước không cắt xén.'
  },
  {
    roomName: 'Phòng khách',
    prompt: 'Phòng khách không gian mở trần cao. Sử dụng Mẫu 1 (gạch khổ lớn 80x80cm) để lát nền chính, lát song song không xen kẽ để không gian trông rộng hơn. Ốp gạch vuông vức từ cửa chính đi vào.'
  },
  {
    roomName: 'Phòng ngủ',
    prompt: 'Phòng ngủ có ánh sáng ấm áp. Sử dụng Mẫu 1 để lát nền. Lát kiểu xương cá (herringbone) hoặc so le 1/2 để tạo cảm giác giống sàn gỗ tự nhiên.'
  },
  {
    roomName: 'Nhà bếp',
    prompt: 'Khu vực bếp nấu. Tường bếp (backsplash) ốp Mẫu 1 thẳng đứng từ mặt bàn đá lên tới cạp tủ trên. Sàn lát Mẫu 2 nguyên viên, ron gạch màu xám dễ vệ sinh.'
  },
  {
    roomName: 'Ban công / Lô gia',
    prompt: 'Ban công ngoài trời. Lát nền bằng Mẫu 1 ghép khoảng cách ron 3mm. Xếp so le 1/3 viên để phân bổ đều các đường ron chống trơn trượt.'
  }
];

export const MATERIAL_LIBRARY: MaterialLibraryItem[] = [
  {
    id: 'mat_wood_1',
    code: 'AC-9015',
    name: 'Gạch nâu',
    size: '30x60cm',
    category: 'floor_tile',
    imageUrl: 'https://w.ladicdn.com/s250x250/64ef6b7f0b7ff20012403c07/nau30x60-20260428164706-jkgfj.jpg',
  },
  {
    id: 'mat_wood_2',
    code: 'OK-8020',
    name: 'Gạch trắng sữa',
    size: '30x60cm',
    category: 'floor_tile',
    imageUrl: 'https://w.ladicdn.com/s250x250/64ef6b7f0b7ff20012403c07/trang30x60-20260428164706-fug-n.jpg',
  },
  {
    id: 'mat_marble_1',
    code: 'MB-6012',
    name: 'Gạch vân đá Marble trắng',
    size: '60x120cm',
    category: 'floor_tile',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'mat_marble_2',
    code: 'MB-8080',
    name: 'Gạch vân đá sáng bóng',
    size: '80x80cm',
    category: 'floor_tile',
    imageUrl: 'https://images.unsplash.com/photo-1543881476-eb5eaf2ef1e0?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'mat_subway_1',
    code: 'SW-0730',
    name: 'Gạch thẻ trắng ốp tường',
    size: '7.5x30cm',
    category: 'wall_tile',
    imageUrl: 'https://images.unsplash.com/photo-1596417088469-5645dbd4d03d?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'mat_terrazzo_1',
    code: 'TZ-6060',
    name: 'Gạch Terrazzo xám',
    size: '60x60cm',
    category: 'floor_tile',
    imageUrl: 'https://images.unsplash.com/photo-1621360140231-155ebc40d58f?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'mat_stone_1',
    code: 'ST-0001',
    name: 'Đá Granite ốp cầu thang',
    size: 'Nguyên khối',
    category: 'stone',
    imageUrl: 'https://images.unsplash.com/photo-1596484552834-8a5626966113?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'mat_mosaic_1',
    code: 'MS-3030',
    name: 'Gạch Mosaic trang trí',
    size: '30x30cm',
    category: 'wall_tile',
    imageUrl: 'https://images.unsplash.com/photo-1520699049698-acd2fceb8cc0?w=800&auto=format&fit=crop&q=80',
  }
];
