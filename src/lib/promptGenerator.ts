import { ProjectState } from '../types';

export function generatePrompt(state: ProjectState): string {
  const { 
    mode,
    selectedSpace, 
    materialAssignments,
    detailedDescription,
    constraints,
    advanced
  } = state;

  let prompt = `Dùng ảnh công trình thực tế làm nền chính. Dùng các ảnh mẫu (nếu có) được gửi kèm sau ảnh hiện trạng để tham chiếu vật liệu, texture, màu sắc và kiểu dáng sản phẩm. Chỉ hoàn thiện phần được chọn, giữ nguyên toàn bộ kiến trúc, góc chụp, phối cảnh, ánh sáng và bố cục gốc. Vật liệu phải bám chính xác lên đúng bề mặt, đúng hình học, đúng chiều sâu không gian, đúng tỷ lệ thực tế, với texture chân thật, phản xạ tự nhiên và bóng đổ đúng hướng.

[HƯỚNG DẪN THAM CHIẾU]:
- Các ảnh mẫu sản phẩm được hệ thống đánh số thứ tự là Mẫu 1, Mẫu 2, Mẫu 3... tương ứng với thứ tự các ảnh được gửi kèm sau ảnh hiện trạng.
- Bạn phải đọc kỹ [YÊU CẦU CHI TIẾT] để biết mẫu nào sẽ được áp dụng cho vị trí nào trong ảnh thực tế.`;

  if (mode === 'structured') {
    const spaceLabel = selectedSpace.replace('_', ' ');
    prompt += `\n\n[KHÔNG GIAN]: ${spaceLabel}.`;

    materialAssignments.forEach((assignment, index) => {
      const surfaceLabel = assignment.surface.toUpperCase();
      const materialLabel = assignment.material.replace('_', ' ');
      const refLabel = `Mẫu ${index + 1}`;
      
      let assignmentPrompt = `\n\n[${surfaceLabel}]: Sử dụng vật liệu ${materialLabel}. ${assignment.description}.`;
      
      if (assignment.referencePhoto) {
        assignmentPrompt += ` TUYỆT ĐỐI CHỈ SỬ DỤNG ${refLabel} làm mẫu texture và màu sắc cho bề mặt [${surfaceLabel}] này.`;
      }
      
      prompt += assignmentPrompt;
    });
    
    if (detailedDescription) {
      prompt += `\n\n[GHI CHÚ THÊM]: ${detailedDescription}`;
    }
  } else {
    prompt += `\n\n[YÊU CẦU CHI TIẾT]: ${detailedDescription || "Hãy hoàn thiện không gian theo các ảnh mẫu vật liệu đi kèm một cách chân thực nhất."}

Ví dụ: Nếu người dùng ghi "Lát sàn bằng Mẫu 1", bạn phải lấy texture từ ảnh mẫu thứ nhất sau ảnh hiện trạng để áp lên sàn.`;
  }

  prompt += `\n\n[QUY TẮC THỰC HIỆN]:
1. Chỉ thay đổi vật liệu trên các bề mặt, giữ nguyên toàn bộ kiến trúc, góc chụp, phối cảnh và bố cục gốc của ảnh hiện trạng.
2. Vật liệu từ ảnh mẫu phải được áp chính xác lên bề mặt trong ảnh hiện trạng, đúng hình học, đúng chiều sâu, đúng tỷ lệ kích thước thực tế nếu người dùng cung cấp các kích thước cụ thể phải tính toán kích thước không gian căn phòng, khu vực để tham chiếu sang kích thước vật liệu mẫu và ghép cho chính xác.
Ví dụ: Nếu người dùng ghi kích thước nhà vệ sinh rộng 2m dài 4m, gạch rộng 30 cm dài 60 cm thì chiều rộng của nhà vệ sinh nếu lát sàn gạch dọc thì cắt 6 viên đủ và 1 viên bị cắt đi 10 cm còn lại 20 cm để lát theo chiều dọc gạch, nếu lát ngang thì 3 viên liền và 1 viên bị cắt 40 cm còn lại 20 cm để lát theo chiều ngang tương ứng chiều rộng của phòng vệ sinh.
Nếu người dùng ghi lát so le thì 1 hàng bắt đầu bằng 1 viên nguyên và hàng tiếp theo bắt đầu bằng 1 nửa viên gạch.
3. CHÚ Ý KHOÉT LỖ GẠCH: Khi ốp, lát gạch (hoặc các vật liệu khác), TUYỆT ĐỐI KHÔNG ĐƯỢC ỐP BÍT KÍN các lỗ chờ kỹ thuật trên tường và sàn. Cụ thể: các vị trí thợ thi công đã để đầu ống chờ (đường ống nước, thoát sàn), đầu ổ điện chờ, lỗ thoáng, quạt hút mùi... PHẢI giữ nguyên và khoét lỗ gạch chính xác xung quanh chúng để các thiết bị sau này (lavabo, vòi sen, bồn cầu, bình nóng lạnh, công tắc...) có thể lắp đặt đúng vị trí.
4. Texture phải chân thật, đường ron hợp lý, độ bóng/mờ tự nhiên, phản xạ ánh sáng và bóng đổ đúng hướng theo nguồn sáng trong ảnh gốc.
5. Kết quả cuối cùng phải trông như một bức ảnh chụp thực tế (photorealistic).

[THÔNG SỐ KỸ THUẬT]:
- Cường độ tuân theo mẫu (Intensity): ${advanced.intensity}%
- Mức độ sáng tạo (Creativity): ${advanced.creativity}%`;

  const constraintPrompts = [];
  if (constraints.preserveArchitecture) constraintPrompts.push("giữ nguyên kiến trúc gốc (preserve original architecture)");
  if (constraints.preservePerspective) constraintPrompts.push("giữ đúng phối cảnh (maintain perspective)");
  if (constraints.preserveLighting) constraintPrompts.push("giữ nguyên ánh sáng thật (keep original lighting)");
  if (constraints.preserveScale) constraintPrompts.push("giữ tỷ lệ thực tế của sản phẩm (accurate scale)");
  if (constraints.noExtraObjects) constraintPrompts.push("không thêm vật thể lạ (no extra objects)");
  if (constraints.realisticPhoto) constraintPrompts.push("ưu tiên ảnh giống chụp thật, photorealistic, 8k resolution, realistic shadows, true-to-life textures");

  if (constraintPrompts.length > 0) {
    prompt += `\n\n[RÀNG BUỘC AI]: ${constraintPrompts.join(', ')}.`;
  }

  prompt += `\n\n[KẾT QUẢ]: Tạo ra ảnh hoàn thiện chuyên nghiệp, sạch sẽ, không có các vật liệu hoặc các đồ vật thi công còn sót lại, không có cảm giác CGI hay minh họa.`;

  return prompt;
}
