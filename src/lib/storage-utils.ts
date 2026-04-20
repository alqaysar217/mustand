
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
 * ضغط الصورة قبل الرفع لتقليل حجم البيانات وتجنب مشاكل وقت التنفيذ أو تجاوز الحدود.
 * يحافظ على وضوح النص مع تقليل الحجم بشكل كبير (أقل من 1 ميجابايت غالباً).
 */
export async function compressImage(dataUrl: string, quality = 0.8, maxWidth = 1600): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // الحفاظ على النسبة والتناسب
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // تعبئة الخلفية باللون الأبيض (مفيد لصور PNG الشفافة)
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        // تحويل لـ JPEG لتقليل الحجم بشكل كبير مقارنة بـ PNG
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
  });
}
