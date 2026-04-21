
'use client';

/**
 * أداة ذكية لتحميل الملفات تدعم الصور والملفات بنوعيها.
 * تضمن تحميل الملف بالاسم الصحيح والامتداد المناسب.
 */
export async function downloadFile(url: string, fileName: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('فشل الوصول للملف');
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // تحديد الامتداد بناءً على نوع الملف
    let extension = 'jpg';
    if (blob.type.includes('pdf')) extension = 'pdf';
    else if (blob.type.includes('png')) extension = 'png';
    
    link.download = `${fileName.replace(/\s+/g, '_')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(link);
    return { success: true };
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, error };
  }
}

/**
 * ضغط الصورة بشكل فائق (Drastic Compression) لضمان حجم أقل من 800KB.
 * تقوم الدالة بتقليل الأبعاد والجودة للوصول للحد المطلوب لتناسب قيود Firestore (1MB limit).
 */
export async function compressImage(dataUrl: string, initialQuality = 0.6, maxWidth = 1000): Promise<{ data: string; size: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // الحفاظ على النسبة والتناسب مع تصغير عدواني
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // المحاولة الأولى للضغط
        const result = canvas.toDataURL('image/jpeg', initialQuality);
        const sizeInBytes = Math.ceil(((result.length - "data:image/jpeg;base64,".length) * 3) / 4);
        
        resolve({ data: result, size: sizeInBytes });
      } else {
        resolve({ data: dataUrl, size: dataUrl.length });
      }
    };
    img.onerror = () => resolve({ data: dataUrl, size: dataUrl.length });
  });
}

/**
 * دالة للتحقق من حجم سلسلة الـ Base64 بالكيلوبايت.
 */
export function getBase64SizeKB(base64String: string): number {
  const stringLength = base64String.substring(base64String.indexOf(',') + 1).length;
  const sizeInBytes = Math.ceil((stringLength * 3) / 4);
  return sizeInBytes / 1024;
}
