import { ProjectState } from '../types';

export function generatePrompt(state: ProjectState): string {
  const { 
    selectedSpace, 
    materialAssignments,
    constraints,
    advanced
  } = state;

  const spaceLabel = selectedSpace.replace('_', ' ');

  let prompt = `Dùng ảnh công trình thực tế làm nền chính. Dùng ảnh mẫu tham chiếu của vật liệu hoặc sản phẩm để ghép vào đúng khu vực đã đánh dấu. Chỉ hoàn thiện phần được chọn, giữ nguyên toàn bộ kiến trúc, góc chụp, phối cảnh, ánh sáng và bố cục gốc. Vật liệu phải bám chính xác lên đúng bề mặt, đúng hình học, đúng chiều sâu không gian, đúng tỷ lệ thực tế, với texture chân thật, đường ron hợp lý, phản xạ tự nhiên, bóng đổ đúng hướng và kết quả giống ảnh chụp thật sau thi công hoàn thiện.`;

  prompt += `\n\n[KHÔNG GIAN]: ${spaceLabel}.`;

  let refPhotoCounter = 1;
  const assignmentsWithPhotos = materialAssignments.filter(a => a.referencePhoto);
  
  materialAssignments.forEach((assignment) => {
    const surfaceLabel = assignment.surface.toUpperCase();
    const materialLabel = assignment.material.replace('_', ' ');
    
    let assignmentPrompt = `\n\n[${surfaceLabel}]: Sử dụng vật liệu ${materialLabel}. ${assignment.description}.`;
    
    if (assignment.referencePhoto) {
      assignmentPrompt += ` TUYỆT ĐỐI CHỈ SỬ DỤNG ảnh mẫu tham chiếu thứ ${refPhotoCounter} (được gửi kèm sau ảnh hiện trạng) làm mẫu texture, màu sắc và kiểu dáng cho bề mặt [${surfaceLabel}] này. KHÔNG ĐƯỢC nhầm lẫn với các ảnh mẫu khác.`;
      refPhotoCounter++;
    }
    
    if (assignment.surface === 'floor') {
      assignmentPrompt += ` Phủ kín toàn bộ bề mặt sàn trong vùng chọn, đúng hướng lát, đúng tỷ lệ viên gạch, đúng đường ron, không tràn lên chân tường hoặc đồ vật khác. Texture của gạch phải thể hiện rõ độ bóng/mờ, phản chiếu ánh sáng từ cửa sổ và đèn trần một cách tự nhiên.`;
    } else if (assignment.surface === 'wall') {
      assignmentPrompt += ` Ốp đúng mảng tường trong vùng chọn, đúng cao độ, đúng phối cảnh, đúng kích thước viên gạch, không tràn sang cửa, khung, kính hoặc các chi tiết khác. Các mép gạch phải sắc nét, khớp với các góc tường và trần.`;
    } else if (['lavabo', 'toilet', 'shower'].includes(assignment.material)) {
      assignmentPrompt += ` Đặt thiết bị vào đúng vị trí sử dụng hợp lý trong không gian, đúng tỷ lệ người dùng thực tế, đúng tiếp xúc với sàn hoặc tường, có bóng đổ tự nhiên và không làm thay đổi cấu trúc phòng. Bề mặt sứ hoặc kim loại phải có độ bóng chân thực.`;
    }

    prompt += assignmentPrompt;
  });

  prompt += `\n\n[QUY TẮC NGHIÊM NGẶT]:
1. TUYỆT ĐỐI KHÔNG nhầm lẫn giữa gạch lát sàn và gạch ốp tường.
2. Mỗi [BỀ MẶT] phải đi kèm đúng [ẢNH MẪU THAM CHIẾU] tương ứng đã chỉ định.
3. Nếu chọn 'floor', vật liệu PHẢI nằm trên mặt đất. Nếu chọn 'wall', vật liệu PHẢI nằm trên các diện đứng.
4. Giữ nguyên cấu trúc gạch, màu sắc và texture từ ảnh mẫu tham chiếu một cách chính xác nhất.
5. KHÔNG ĐƯỢC lấy ảnh mẫu của sàn để ốp lên tường và ngược lại. Đây là yêu cầu quan trọng nhất.`;

  prompt += `\n\n[THÔNG SỐ KỸ THUẬT]:
- Không gian: ${spaceLabel}
- Cường độ tuân theo mẫu: ${advanced.intensity}%
- Mức độ sáng tạo: ${advanced.creativity}%`;

  const constraintPrompts = [];
  if (constraints.preserveArchitecture) constraintPrompts.push("giữ nguyên kiến trúc gốc (preserve original architecture)");
  if (constraints.preservePerspective) constraintPrompts.push("giữ đúng phối cảnh (maintain perspective)");
  if (constraints.preserveLighting) constraintPrompts.push("giữ nguyên ánh sáng thật (keep original lighting)");
  if (constraints.preserveScale) constraintPrompts.push("giữ tỷ lệ thực tế của sản phẩm (accurate scale)");
  if (constraints.noExtraObjects) constraintPrompts.push("không thêm vật thể lạ (no extra objects)");
  if (constraints.realisticPhoto) constraintPrompts.push("ưu tiên ảnh giống chụp thật, photorealistic, 8k resolution, realistic shadows, true-to-life textures, like real post-construction photography");

  if (constraintPrompts.length > 0) {
    prompt += `\n\n[RÀNG BUỘC]: ${constraintPrompts.join(', ')}.`;
  }

  prompt += `\n\n[KẾT QUẢ]: Ảnh đầu ra phải trông như một bức ảnh chụp thực tế sau khi công trình đã hoàn thiện xong xuôi, sạch sẽ, chuyên nghiệp, không có cảm giác CGI hay minh họa.`;

  return prompt;
}
